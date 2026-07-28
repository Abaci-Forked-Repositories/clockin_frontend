import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { Form } from 'reactstrap';
import { useForm } from 'react-hook-form';
import OffCanvasComponent from '../../../components/OffCanvasComponent';
import Card, { CardBody } from '../../../components/bootstrap/Card';
import SaveButton from '../../../components/CustomComponent/Buttons/SaveButton';
import CustomSpinner from '../../../components/CustomSpinner/CustomSpinner';
import { authAxios } from '../../../axiosInstance';
import useToasterNotification from '../../../hooks/useToasterNotification';
import AssetTypeFields from './AssetTypeFields';

type AssetTypeFormValues = {
	name: string;
	description: string;
	is_consumable: boolean;
	is_bookable: boolean;
	is_self_requestable: boolean;
	user_selects_item: boolean;
};

const defaultValues: AssetTypeFormValues = {
	name: '',
	description: '',
	is_consumable: false,
	is_bookable: false,
	is_self_requestable: true,
	user_selects_item: false,
};

const buildPayload = (data: AssetTypeFormValues) => ({
	name: String(data?.name || '').trim(),
	description: String(data?.description || '').trim(),
	is_consumable: Boolean(data?.is_consumable),
	is_bookable: Boolean(data?.is_bookable),
	is_self_requestable: Boolean(data?.is_self_requestable),
	user_selects_item: Boolean(data?.user_selects_item),
});

const AddAssetType = ({ isOpen, setIsOpen, tableRef, title, id }: any) => {
	const {
		register,
		handleSubmit,
		reset,
		control,
		formState: { errors },
	} = useForm<AssetTypeFormValues>({
		defaultValues,
	});

	const [waitingForAxios, setWaitingForAxios] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
	const { showErrorNotification } = useToasterNotification();
	const isEdit = Boolean(id);

	useEffect(() => {
		if (!isOpen) return undefined;
		if (!isEdit) {
			reset(defaultValues);
			setIsLoading(false);
			return undefined;
		}

		let cancelled = false;
		setIsLoading(true);

		authAxios
			.get(`/api/hr/asset-types/${id}/`)
			.then((res) => {
				if (cancelled) return;
				const data = res?.data ?? {};
				reset({
					name: data?.name || '',
					description: data?.description || '',
					is_consumable: Boolean(data?.is_consumable),
					is_bookable: Boolean(data?.is_bookable),
					is_self_requestable: Boolean(data?.is_self_requestable),
					user_selects_item: Boolean(data?.user_selects_item),
				});
			})
			.catch((err) => {
				if (!cancelled) showErrorNotification(err);
			})
			.finally(() => {
				if (!cancelled) setIsLoading(false);
			});

		return () => {
			cancelled = true;
		};
	}, [id, isEdit, isOpen, reset, showErrorNotification]);

	const onSubmit = (data: AssetTypeFormValues) => {
		setWaitingForAxios(true);
		const payload = buildPayload(data);

		const req = isEdit
			? authAxios.patch(`/api/hr/asset-types/${id}/`, payload)
			: authAxios.post('/api/hr/asset-types/', payload);

		req
			.then(() => {
				setWaitingForAxios(false);
				tableRef?.current?.onQueryChange?.();
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
								<AssetTypeFields register={register} control={control} errors={errors} />
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

AddAssetType.propTypes = {
	isOpen: PropTypes.bool.isRequired,
	setIsOpen: PropTypes.func.isRequired,
	tableRef: PropTypes.object.isRequired,
	title: PropTypes.string.isRequired,
	id: PropTypes.any,
};

AddAssetType.defaultProps = {
	id: null,
};

export default AddAssetType;
