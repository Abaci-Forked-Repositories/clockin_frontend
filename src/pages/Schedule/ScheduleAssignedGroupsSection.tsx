import React, { useEffect, useMemo, useState } from 'react';
import Swal from 'sweetalert2';
import { Form } from 'reactstrap';
import { useForm } from 'react-hook-form';
import { Tooltip } from '@mui/material';
import { authAxios } from '../../axiosInstance';
import Card, { CardActions, CardBody, CardHeader, CardLabel, CardTitle } from '../../components/bootstrap/Card';
import Button from '../../components/bootstrap/Button';
import ListGroup, { ListGroupItem } from '../../components/bootstrap/ListGroup';
import Modal, { ModalBody, ModalFooter, ModalHeader, ModalTitle } from '../../components/bootstrap/Modal';
import CustomSpinner from '../../components/CustomSpinner/CustomSpinner';
import AddButton from '../../components/CustomComponent/Buttons/AddButton';
import SaveButton from '../../components/CustomComponent/Buttons/SaveButton';
import ReactSelectComponent from '../../components/CustomComponent/Select/ReactSelectComponent';
import useToasterNotification from '../../hooks/useToasterNotification';
import { buttonColor } from '../../helpers/constants';
import {
	assignScheduleToGroup,
	normalizeAssignedGroups,
	unassignScheduleFromGroup,
	type AssignedGroupRow,
} from './scheduleGroupAssignment';

type SelectOption = { label: string; value: number };

type AddGroupsModalProps = {
	isOpen: boolean;
	setIsOpen: (open: boolean) => void;
	scheduleId: number;
	assignedGroupIds: number[];
	onAssigned: () => void;
};

const AddGroupsModal = ({
	isOpen,
	setIsOpen,
	scheduleId,
	assignedGroupIds,
	onAssigned,
}: AddGroupsModalProps) => {
	const [options, setOptions] = useState<SelectOption[]>([]);
	const [loading, setLoading] = useState(false);
	const [saving, setSaving] = useState(false);
	const { showErrorNotification, showSuccessNotification } = useToasterNotification();

	const {
		control,
		handleSubmit,
		reset,
		getValues,
		formState: { errors },
	} = useForm<{ groups: SelectOption[] }>({
		defaultValues: { groups: [] },
	});

	useEffect(() => {
		let cancelled = false;
		setLoading(true);
		authAxios
			.get('api/hr/groups/?paginate=off')
			.then((res) => {
				if (cancelled) return;
				const list = Array.isArray(res.data) ? res.data : res.data?.results || [];
				const assigned = new Set(assignedGroupIds);
				setOptions(
					list
						.filter((item: any) => !assigned.has(Number(item?.id)))
						.map((item: any) => ({
							label: item?.name || `Group ${item?.id}`,
							value: Number(item?.id),
						}))
						.filter((opt: SelectOption) => !Number.isNaN(opt.value)),
				);
			})
			.catch((err) => {
				if (!cancelled) showErrorNotification(err);
			})
			.finally(() => {
				if (!cancelled) setLoading(false);
			});
		return () => {
			cancelled = true;
		};
	}, []);

	const onSubmit = (data: { groups: SelectOption[] }) => {
		const groupIds = (data?.groups || [])
			.map((g) => g.value)
			.filter((id) => !Number.isNaN(id));
		if (!groupIds.length) {
			showErrorNotification('Select at least one group');
			return;
		}
		setSaving(true);
		Promise.all(groupIds.map((groupId) => assignScheduleToGroup(groupId, scheduleId)))
			.then(() => {
				showSuccessNotification('Group(s) assigned');
				reset({ groups: [] });
				setIsOpen(false);
				onAssigned();
			})
			.catch(showErrorNotification)
			.finally(() => setSaving(false));
	};

	return (
		<Modal isOpen={isOpen} setIsOpen={setIsOpen} size='md' isCentered>
			<ModalHeader className='p-4' setIsOpen={setIsOpen}>
				<ModalTitle id='assign-groups-modal'>Assign groups</ModalTitle>
			</ModalHeader>
			<Form onSubmit={handleSubmit(onSubmit)}>
				<ModalBody className='px-4 pb-2'>
					{loading ? (
						<div className='d-flex justify-content-center py-4'>
							<CustomSpinner />
						</div>
					) : (
						<ReactSelectComponent
							control={control}
							name='Groups *'
							isMulti
							field_name='groups'
							getValues={getValues}
							errors={errors}
							options={options}
							isRequired
						/>
					)}
				</ModalBody>
				<ModalFooter className='px-4 pb-4'>
					<Button color='dark' isLight type='button' onClick={() => setIsOpen(false)}>
						Cancel
					</Button>
					<div className='flex-grow-1' style={{ maxWidth: '12rem' }}>
						<SaveButton state={saving || loading} />
					</div>
				</ModalFooter>
			</Form>
		</Modal>
	);
};

type GroupRowProps = {
	group: AssignedGroupRow;
	onRemove: (group: AssignedGroupRow) => void;
	removing: boolean;
};

const GroupRow = ({ group, onRemove, removing }: GroupRowProps) => (
	<ListGroupItem className='border-0 border-bottom px-0 py-2'>
		<div className='d-flex align-items-center justify-content-between gap-2'>
			<span className='fw-semibold text-body text-truncate'>{group.name}</span>
			<Tooltip arrow title='Remove from schedule' placement='top'>
				<Button
					isOutline={false}
					color='danger'
					isLight
					size='sm'
					icon='Delete'
					isDisable={removing}
					onClick={() => onRemove(group)}
				/>
			</Tooltip>
		</div>
	</ListGroupItem>
);

type ScheduleAssignedGroupsSectionProps = {
	scheduleId?: string | number | null;
	groups: unknown;
	onChanged?: () => void;
};

const ScheduleAssignedGroupsSection = ({
	scheduleId,
	groups,
	onChanged,
}: ScheduleAssignedGroupsSectionProps) => {
	const assigned = useMemo(() => normalizeAssignedGroups(groups), [groups]);
	const assignedIds = useMemo(() => assigned.map((g) => g.id), [assigned]);
	const numericScheduleId = scheduleId != null && scheduleId !== '' ? Number(scheduleId) : NaN;
	const canManage = !Number.isNaN(numericScheduleId);

	const [addOpen, setAddOpen] = useState(false);
	const [removingId, setRemovingId] = useState<number | null>(null);
	const { showErrorNotification, showSuccessNotification } = useToasterNotification();

	const handleRemove = (group: AssignedGroupRow) => {
		if (!canManage) return;
		Swal.fire({
			title: 'Remove group?',
			text: `Remove "${group.name}" from this schedule?`,
			icon: 'warning',
			showCancelButton: true,
			iconColor: buttonColor[0],
			confirmButtonColor: buttonColor[0],
			cancelButtonColor: buttonColor[1],
			confirmButtonText: 'Remove',
		}).then((result) => {
			if (!result.isConfirmed) return;
			setRemovingId(group.id);
			unassignScheduleFromGroup(group.id, numericScheduleId)
				.then(() => {
					showSuccessNotification('Group removed');
					onChanged?.();
				})
				.catch(showErrorNotification)
				.finally(() => setRemovingId(null));
		});
	};

	return (
		<>
			<Card className='h-100 schedule-assigned-groups-card'>
				<CardHeader className='schedule-assigned-groups-card__header'>
					<CardLabel icon='Groups' iconColor='warning' className='min-w-0'>
						<CardTitle tag='div' className='h5 text-warning mb-0 text-truncate'>
							Assigned groups
						</CardTitle>
					</CardLabel>
					{canManage && (
						<CardActions className='schedule-assigned-groups-card__actions'>
							<AddButton modalShow={setAddOpen} name='Add' />
						</CardActions>
					)}
				</CardHeader>
				<CardBody className='d-flex flex-column h-100 pt-0'>
					{assigned.length ? (
						<ListGroup isFlush className='flex-grow-1'>
							{assigned.map((group) => (
								<GroupRow
									key={group.id}
									group={group}
									onRemove={handleRemove}
									removing={removingId === group.id}
								/>
							))}
						</ListGroup>
					) : (
						<p className='text-muted small mb-0'>No groups assigned</p>
					)}
				</CardBody>
			</Card>
			{canManage && addOpen && (
				<AddGroupsModal
					isOpen={addOpen}
					setIsOpen={setAddOpen}
					scheduleId={numericScheduleId}
					assignedGroupIds={assignedIds}
					onAssigned={() => onChanged?.()}
				/>
			)}
		</>
	);
};

export default ScheduleAssignedGroupsSection;
