import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { Form } from 'reactstrap';
import { useForm } from 'react-hook-form';
import OffCanvasComponent from '../../components/OffCanvasComponent';
import Card, { CardBody } from '../../components/bootstrap/Card';
import SaveButton from '../../components/CustomComponent/Buttons/SaveButton';
import { authAxios } from '../../axiosInstance';
import useToasterNotification from '../../hooks/useToasterNotification';
import GroupFields from './GroupFields';
import CustomSpinner from '../../components/CustomSpinner/CustomSpinner';
import {
	COMPANY_HR_SETTINGS_DEFAULTS,
	unwrapCompanyHrSettings,
} from '../Settings/companyHrSettingsUtils';

const DEFAULT_ATTENDANCE_EMAILING_TIME = '06:00';

const toTimeInputValue = (raw: unknown): string => {
	const text = String(raw ?? '').trim();
	if (!text) return DEFAULT_ATTENDANCE_EMAILING_TIME;
	const parts = text.split(':');
	if (parts.length < 2) return DEFAULT_ATTENDANCE_EMAILING_TIME;
	const hours = String(parts[0] || '0').padStart(2, '0');
	const minutes = String(parts[1] || '0').padStart(2, '0');
	return `${hours}:${minutes}`;
};

const toApiTimeValue = (raw: unknown): string => {
	const text = String(raw ?? '').trim();
	if (!text) return `${DEFAULT_ATTENDANCE_EMAILING_TIME}:00`;
	const parts = text.split(':');
	if (parts.length === 2) return `${parts[0]}:${parts[1]}:00`;
	if (parts.length >= 3) return `${parts[0]}:${parts[1]}:${parts[2]}`;
	return `${DEFAULT_ATTENDANCE_EMAILING_TIME}:00`;
};

const AddGroup = ({ isOpen, setIsOpen, tableRef, title, id }: any) => {
	const {
		register,
		handleSubmit,
		getValues,
		control,
		reset,
		formState: { errors },
	} = useForm({
		defaultValues: {
			name: '',
			group_type: null,
			priority_choice_number: 0,
			parent_group: null,
			lead_one: null,
			lead_two: null,
			schedule: [],
			sites: [],
			leave_types: [],
			attendance_emailing_enabled: true,
			attendance_emailing_time: DEFAULT_ATTENDANCE_EMAILING_TIME,
		},
	});

	const [waitingForAxios, setWaitingForAxios] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
	const [parentGroupOptions, setParentGroupOptions] = useState([]);
	const [leadOptions, setLeadOptions] = useState([]);
	const [scheduleOptions, setScheduleOptions] = useState([]);
	const [sitesOptions, setSitesOptions] = useState([]);
	const [leaveTypeOptions, setLeaveTypeOptions] = useState([]);
	const [defaultTimezone, setDefaultTimezone] = useState(
		COMPANY_HR_SETTINGS_DEFAULTS.default_timezone,
	);
	const { showErrorNotification } = useToasterNotification();
	const isEdit = Boolean(id);

	useEffect(() => {
		if (!isOpen) return;

		setIsLoading(true);

		const groupsReq = authAxios.get('api/hr/groups/?paginate=off');
		const usersReq = authAxios.get('api/hr/accounts/?paginate=off');
		const schedulesReq = authAxios.get('api/hr/schedules/?paginate=off');
		const sitesReq = authAxios.get('api/hr/sites/?paginate=off');
		const leaveTypesReq = authAxios.get('/api/hr/leave-types/?paginate=off');
		const settingsReq = authAxios
			.get('/api/hr/company-hr-settings/')
			.then((res) => {
				const settingsRow = unwrapCompanyHrSettings(res?.data);
				const timezone = String(
					(settingsRow as Record<string, unknown> | null)?.default_timezone ||
						COMPANY_HR_SETTINGS_DEFAULTS.default_timezone,
				).trim();
				setDefaultTimezone(timezone || COMPANY_HR_SETTINGS_DEFAULTS.default_timezone);
			})
			.catch(() => {
				setDefaultTimezone(COMPANY_HR_SETTINGS_DEFAULTS.default_timezone);
			});
		const groupReq = isEdit ? authAxios.get(`api/hr/groups/${id}/`) : Promise.resolve(null);

		Promise.all([
			groupsReq,
			usersReq,
			schedulesReq,
			sitesReq,
			leaveTypesReq,
			settingsReq,
			groupReq,
		])
			.then(
				([
					groupsRes,
					usersRes,
					schedulesRes,
					sitesRes,
					leaveTypesRes,
					,
					groupRes,
				]: any) => {
				const groupOptions =
					groupsRes?.data?.map((item: any) => ({
						label: item?.name,
						value: item?.id,
						...item,
					})) || [];
				setParentGroupOptions(groupOptions);

				const options =
					usersRes?.data?.map((item: any) => ({
						label:
							`${item?.preferred_name || ''}`.trim() ||
							`${item?.first_name || ''} ${item?.last_name || ''}`.trim() ||
							item?.email,
						value: item?.id,
						...item,
					})) || [];
				setLeadOptions(options);
				const schedules =
					schedulesRes?.data?.map((item: any) => ({
						label: item?.name || `Schedule ${item?.id}`,
						value: item?.id,
						...item,
					})) || [];
				setScheduleOptions(schedules);

				const siteOpts =
					sitesRes?.data?.map((item: any) => ({
						label: item?.name,
						value: item?.id,
						...item,
					})) || [];
				setSitesOptions(siteOpts);

				const leaveTypesData = Array.isArray(leaveTypesRes?.data)
					? leaveTypesRes.data
					: leaveTypesRes?.data?.results || [];
				const leaveTypes =
					leaveTypesData.map((item: any) => ({
						label: item?.name || item?.code || `Leave Type ${item?.id}`,
						value: item?.id,
						...item,
					})) || [];
				setLeaveTypeOptions(leaveTypes);

				const group = groupRes?.data;
				const selectedParent =
					groupOptions.find((opt: any) => opt.value === group?.parent_group) || null;
				const selectedLeadOne =
					options.find((opt: any) => opt.value === group?.lead_one) || null;
				const selectedLeadTwo =
					options.find((opt: any) => opt.value === group?.lead_two) || null;
				const selectedType = group?.type
					? { label: group.type, value: group.type }
					: null;
				const selectedSchedules =
					(group?.schedules || group?.schedule_ids || [])
						.map((scheduleItem: any) => {
							const scheduleId =
								typeof scheduleItem === 'object'
									? scheduleItem?.id ?? scheduleItem?.value
									: scheduleItem;
							if (scheduleId == null) return null;
							const option = schedules.find(
								(opt: any) => String(opt.value) === String(scheduleId),
							);
							if (option) return option;
							if (typeof scheduleItem === 'object') {
								return {
									label: scheduleItem?.name || `Schedule ${scheduleId}`,
									value: scheduleId,
									...scheduleItem,
								};
							}
							return null;
						})
						.filter(Boolean) || [];

				const rawSites = (() => {
					if (Array.isArray(group?.sites) && group.sites.length) return group.sites;
					if (Array.isArray(group?.sites) && group.sites.length) return group.sites;
					if (group?.site != null) return [group.site];
					if (group?.site != null) return [group.site];
					return [];
				})();
				const selectedSites =
					rawSites
						.map((siteItem: any) => {
							const siteId =
								typeof siteItem === 'object'
									? siteItem?.id ?? siteItem?.value
									: siteItem;
							if (siteId == null) return null;
							const option = siteOpts.find(
								(opt: any) => String(opt.value) === String(siteId),
							);
							if (option) return option;
							if (typeof siteItem === 'object') {
								return {
									label: siteItem?.name || `Site ${siteId}`,
									value: siteId,
									...siteItem,
								};
							}
							return null;
						})
						.filter(Boolean) || [];

				const rawLeaveTypes =
					group?.leave_types ??
					group?.leave_type_ids ??
					[];
				const selectedLeaveTypes = (Array.isArray(rawLeaveTypes) ? rawLeaveTypes : [])
					.map((ltItem: any) => {
						const ltId =
							typeof ltItem === 'object' && ltItem != null
								? ltItem?.id ?? ltItem?.value
								: ltItem;
						if (ltId == null) return null;
						const option = leaveTypes.find(
							(opt: any) => String(opt.value) === String(ltId),
						);
						if (option) return option;
						if (typeof ltItem === 'object') {
							return {
								label: ltItem?.name || ltItem?.code || `Leave Type ${ltId}`,
								value: ltId,
								...ltItem,
							};
						}
						return null;
					})
					.filter(Boolean);

				const attendanceEmailingEnabled =
					group == null
						? true
						: group?.attendance_emailing_enabled === true ||
							group?.attendance_emailing_enabled === 'true' ||
							group?.attendance_emailing_enabled === 1 ||
							group?.attendance_emailing_enabled === '1';

				reset({
					name: group?.name || '',
					group_type: selectedType,
					priority_choice_number: group?.priority_choice_number ?? 0,
					parent_group: selectedParent,
					lead_one: selectedLeadOne,
					lead_two: selectedLeadTwo,
					schedule: selectedSchedules,
					sites: selectedSites,
					leave_types: selectedLeaveTypes,
					attendance_emailing_enabled: attendanceEmailingEnabled,
					attendance_emailing_time: toTimeInputValue(
						group?.attendance_emailing_time || DEFAULT_ATTENDANCE_EMAILING_TIME,
					),
				});
				setIsLoading(false);
			})
			.catch((err) => {
				showErrorNotification(err);
				setIsLoading(false);
			});
	}, []);

	const onSubmit = (data: any) => {
		setWaitingForAxios(true);
		const attendanceEmailingEnabled = Boolean(data?.attendance_emailing_enabled);
		const sharedPayload = {
			name: data?.name || '',
			type: data?.group_type?.value || '',
			priority_choice_number: Number(data?.priority_choice_number || 0),
			parent_group: data?.parent_group?.value || null,
			lead_one: data?.lead_one?.value || null,
			lead_two: data?.lead_two?.value || null,
			schedules: (data?.schedule || []).map((schedule: any) => schedule?.value),
			sites: (data?.sites || [])
				.map((siteItem: any) => Number(siteItem?.value))
				.filter((n: number) => !Number.isNaN(n)),
			leave_types: (data?.leave_types || [])
				.map((lt: any) => Number(lt?.value))
				.filter((n: number) => !Number.isNaN(n)),
			attendance_emailing_enabled: attendanceEmailingEnabled,
			attendance_emailing_time: toApiTimeValue(
				data?.attendance_emailing_time || DEFAULT_ATTENDANCE_EMAILING_TIME,
			),
		};

		const request = isEdit
			? authAxios.patch(`api/hr/groups/${id}/`, sharedPayload)
			: authAxios.post('api/hr/groups/', sharedPayload);

		request
			.then(() => {
				setWaitingForAxios(false);
				tableRef?.current?.onQueryChange();
				setIsOpen(false);
			})
			.catch((err) => {
				setWaitingForAxios(false);
				showErrorNotification(err);
			});
	};

	return (
		<OffCanvasComponent isOpen={isOpen} placement='end' title={title} setOpen={setIsOpen}>
			<Form onSubmit={handleSubmit(onSubmit)}>
				<Card>
					<CardBody>
						{isLoading ? (
							<CustomSpinner />
						) : (
							<>
								<GroupFields
									register={register}
									errors={errors}
									control={control}
									getValues={getValues}
									parentGroupOptions={parentGroupOptions}
									leadOptions={leadOptions}
									scheduleOptions={scheduleOptions}
									sitesOptions={sitesOptions}
									leaveTypeOptions={leaveTypeOptions}
									defaultTimezone={defaultTimezone}
								/>
								<div className='row m-0'>
									<div className='col-12 p-3'>
										<SaveButton state={waitingForAxios} />
									</div>
								</div>
							</>
						)}
					</CardBody>
				</Card>
			</Form>
		</OffCanvasComponent>
	);
};

/* eslint-disable react/forbid-prop-types */
AddGroup.propTypes = {
	isOpen: PropTypes.bool.isRequired,
	setIsOpen: PropTypes.func.isRequired,
	tableRef: PropTypes.object.isRequired,
	title: PropTypes.string.isRequired,
	id: PropTypes.any,
};
/* eslint-enable react/forbid-prop-types */

AddGroup.defaultProps = {
	id: null,
};

export default AddGroup;
