import React, { useEffect, useState } from 'react';
import { Form } from 'reactstrap';
import dayjs from 'dayjs';
import OffCanvasComponent from '../../../components/OffCanvasComponent';
import Card, { CardBody } from '../../../components/bootstrap/Card';
import FormGroup from '../../../components/bootstrap/forms/FormGroup';
import SaveButton from '../../../components/CustomComponent/Buttons/SaveButton';
import { authAxios } from '../../../axiosInstance';
import useToasterNotification from '../../../hooks/useToasterNotification';
import {
	bookingDatetimesFromDates,
	parseDatetimeLocalValue,
} from '../AssetRequest/assetRequestItemUtils';
import {
	resolveSiteTimezoneIana,
} from '../../../helpers/siteTimezoneDatetime';
import { formatSiteTimezone } from '../../Site/SiteDetails/SiteDetails';

type BookAssetBookingFormProps = {
	isOpen: boolean;
	setIsOpen: (open: boolean) => void;
	asset: Record<string, unknown> | null;
	selectedDate: Date | null;
	onBooked?: () => void;
};

const pad2 = (n: number) => String(n).padStart(2, '0');

const toDatetimeLocal = (date: Date, hours: number, minutes: number): string => {
	const y = date.getFullYear();
	const m = pad2(date.getMonth() + 1);
	const d = pad2(date.getDate());
	return `${y}-${m}-${d}T${pad2(hours)}:${pad2(minutes)}`;
};

const resolveAssetLabel = (asset: Record<string, unknown> | null): string => {
	if (!asset) return 'Asset';
	const name = String(asset.name || '').trim();
	const code = String(asset.asset_code || '').trim();
	return [name, code].filter(Boolean).join(' — ') || `Asset ${asset.id}`;
};

const BookAssetBookingForm = ({
	isOpen,
	setIsOpen,
	asset,
	selectedDate,
	onBooked,
}: BookAssetBookingFormProps) => {
	const { showErrorNotification, showNotification } = useToasterNotification();
	const [startDatetime, setStartDatetime] = useState('');
	const [endDatetime, setEndDatetime] = useState('');
	const [description, setDescription] = useState('');
	const [notes, setNotes] = useState('');
	const [waitingForAxios, setWaitingForAxios] = useState(false);

	const site =
		asset?.site != null && typeof asset.site === 'object'
			? (asset.site as Record<string, unknown>)
			: null;
	const siteTimezoneIana = resolveSiteTimezoneIana(site);
	const siteTimezone = formatSiteTimezone(site) || siteTimezoneIana;

	useEffect(() => {
		if (!isOpen) return;
		const day = selectedDate || new Date();
		setStartDatetime(toDatetimeLocal(day, 9, 0));
		setEndDatetime(toDatetimeLocal(day, 18, 0));
		setDescription('');
		setNotes('');
	}, [isOpen, selectedDate]);

	const onSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		const assetId = asset?.id;
		if (assetId == null || assetId === '') {
			showNotification('Error', 'Asset is missing.', 'danger');
			return;
		}
		if (!startDatetime || !endDatetime) {
			showNotification('Error', 'Enter booking start and end date & time.', 'danger');
			return;
		}

		const start = parseDatetimeLocalValue(startDatetime);
		const end = parseDatetimeLocalValue(endDatetime);
		if (start && end) {
			const startMs = new Date(`${start.date}T${start.time}`).getTime();
			const endMs = new Date(`${end.date}T${end.time}`).getTime();
			if (!Number.isNaN(startMs) && !Number.isNaN(endMs) && endMs < startMs) {
				showNotification('Error', 'End must be after start.', 'danger');
				return;
			}
		}

		const booking = bookingDatetimesFromDates(
			startDatetime,
			endDatetime,
			siteTimezoneIana,
		);
		if (!booking) {
			showNotification('Error', 'Invalid booking date & time.', 'danger');
			return;
		}

		const itemPayload: Record<string, unknown> = {
			asset_item: Number(assetId),
			start_datetime: booking.start_datetime,
			end_datetime: booking.end_datetime,
		};
		if (notes.trim()) itemPayload.description = notes.trim();

		setWaitingForAxios(true);
		authAxios
			.post('/api/hr/asset-requests/', {
				description: description.trim() || '',
				items: [itemPayload],
			})
			.then(() => {
				setWaitingForAxios(false);
				showNotification('Success', 'Asset booking request submitted.', 'success');
				onBooked?.();
				setIsOpen(false);
			})
			.catch((err) => {
				setWaitingForAxios(false);
				showErrorNotification(err);
			});
	};

	return (
		<OffCanvasComponent
			isOpen={isOpen}
			placement='end'
			title='Book Asset'
			setOpen={setIsOpen}>
			<Form onSubmit={onSubmit}>
				<Card>
					<CardBody>
						<div className='row g-3'>
							<div className='col-12'>
								<FormGroup label='Asset'>
									<input
										type='text'
										className='form-control'
										value={resolveAssetLabel(asset)}
										disabled
										readOnly
									/>
								</FormGroup>
								{siteTimezone ? (
									<div className='small text-muted mt-1'>
										Times are in site timezone: {siteTimezone}
										{siteTimezoneIana && siteTimezoneIana !== siteTimezone
											? ` (${siteTimezoneIana})`
											: ''}
									</div>
								) : (
									<div className='small text-muted mt-1'>
										Times use your browser timezone (site timezone unavailable).
									</div>
								)}
								{selectedDate ? (
									<div className='small text-muted mt-1'>
										Selected day:{' '}
										{dayjs(selectedDate).format('ddd, D MMM YYYY')}
									</div>
								) : null}
							</div>

							<div className='col-12'>
								<FormGroup label='Start date & time *'>
									<input
										type='datetime-local'
										step={60}
										className='form-control'
										value={startDatetime}
										onChange={(e) => setStartDatetime(e.target.value)}
										required
									/>
								</FormGroup>
							</div>

							<div className='col-12'>
								<FormGroup label='End date & time *'>
									<input
										type='datetime-local'
										step={60}
										className='form-control'
										value={endDatetime}
										onChange={(e) => setEndDatetime(e.target.value)}
										required
									/>
								</FormGroup>
							</div>

							<div className='col-12'>
								<FormGroup label='Request notes'>
									<textarea
										className='form-control'
										rows={2}
										placeholder='Optional request description'
										value={description}
										onChange={(e) => setDescription(e.target.value)}
									/>
								</FormGroup>
							</div>

							<div className='col-12'>
								<FormGroup label='Item notes'>
									<textarea
										className='form-control'
										rows={2}
										placeholder='e.g. Needed for client demo'
										value={notes}
										onChange={(e) => setNotes(e.target.value)}
									/>
								</FormGroup>
							</div>

							<div className='col-12'>
								<SaveButton state={waitingForAxios} />
							</div>
						</div>
					</CardBody>
				</Card>
			</Form>
		</OffCanvasComponent>
	);
};

export default BookAssetBookingForm;
