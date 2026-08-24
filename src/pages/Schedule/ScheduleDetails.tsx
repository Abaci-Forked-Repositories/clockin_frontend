import React from 'react';
import Card, { CardBody, CardHeader, CardLabel, CardTitle } from '../../components/bootstrap/Card';
import Icon from '../../components/icon/Icon';
import { shiftHoursTargetFromApi } from './ScheduleFields';
import ScheduleAssignedGroupsSection from './ScheduleAssignedGroupsSection';

const DetailRow = ({
	label,
	value,
	span,
}: {
	label: string;
	value?: React.ReactNode;
	span?: 2;
}) => {
	const hasValue = value != null && value !== '';
	return (
		<div
			className={`schedule-detail-card__field${
				span === 2 ? ' schedule-detail-card__field--span-2' : ''
			}`}>
			<div className='schedule-detail-card__label'>{label}</div>
			<div className='schedule-detail-card__value'>{hasValue ? value : '—'}</div>
		</div>
	);
};

const formatShifts = (schedule: any) => {
	if (Array.isArray(schedule?.shifts) && schedule.shifts.length) {
		const names = schedule.shifts
			.map((shift: any) => shift?.name || shift?.shift_name)
			.filter(Boolean);
		if (names.length) return names.join(', ');
	}
	return (
		schedule?.shift_details?.name ||
		schedule?.shift_details?.shift_name ||
		schedule?.shift_name ||
		''
	);
};

const dayMeta: Record<string, { label: string; bg: string; color: string }> = {
	MON: { label: 'Mon', bg: '#e7f1ff', color: '#0d6efd' },
	TUE: { label: 'Tue', bg: '#e8f7ee', color: '#198754' },
	WED: { label: 'Wed', bg: '#fff3e6', color: '#fd7e14' },
	THU: { label: 'Thu', bg: '#f3e8ff', color: '#6f42c1' },
	FRI: { label: 'Fri', bg: '#e6f7f9', color: '#0f6d7a' },
	SAT: { label: 'Sat', bg: '#fff0f3', color: '#d63384' },
	SUN: { label: 'Sun', bg: '#f8f9fa', color: '#495057' },
};

const renderApplicableDays = (days: any) => {
	if (!Array.isArray(days) || days.length === 0) return undefined;
	return (
		<div className='schedule-detail-card__days'>
			{days.map((rawDay: any) => {
				const key = String(rawDay || '').toUpperCase();
				const meta = dayMeta[key] || {
					label: key || '—',
					bg: '#eef2f7',
					color: '#344054',
				};
				return (
					<span
						key={key}
						className='schedule-detail-card__day'
						style={{ backgroundColor: meta.bg, color: meta.color }}>
						{meta.label}
					</span>
				);
			})}
		</div>
	);
};

type ScheduleDetailsProps = {
	schedule: any | null;
	scheduleId?: string | number | null;
	onGroupsChanged?: () => void;
};

const ScheduleDetails = ({ schedule, scheduleId, onGroupsChanged }: ScheduleDetailsProps) => {
	if (!schedule) {
		return null;
	}

	const dateRange =
		schedule?.start_date || schedule?.end_date
			? `${schedule?.start_date || '—'} → ${schedule?.end_date || '—'}`
			: '';

	return (
		<div className='row g-4 align-items-stretch'>
			<div className='col-lg-7'>
				<Card className='h-100 schedule-detail-card'>
					<CardHeader className='schedule-detail-card__header'>
						<CardLabel icon='Schedule' iconColor='warning'>
							<CardTitle tag='div' className='h5 text-warning mb-0'>
								Schedule details
							</CardTitle>
						</CardLabel>
					</CardHeader>
					<CardBody className='schedule-detail-card__body pt-0'>
						<div className='schedule-detail-card__hero'>
							<span className='schedule-detail-card__hero-icon' aria-hidden>
								<Icon icon='Schedule' size='lg' color='warning' />
							</span>
							<div className='schedule-detail-card__hero-text'>
								<div className='schedule-detail-card__name'>
									{schedule?.name || '—'}
								</div>
								{dateRange ? (
									<div className='schedule-detail-card__subtitle'>{dateRange}</div>
								) : null}
							</div>
						</div>

						<div className='schedule-detail-card__fields'>
							<DetailRow label='Shift(s)' value={formatShifts(schedule)} span={2} />
							<DetailRow label='Start date' value={schedule?.start_date} />
							<DetailRow label='End date' value={schedule?.end_date} />
							<DetailRow
								label='Applicable days'
								value={renderApplicableDays(schedule?.applicable_days)}
								span={2}
							/>
							<DetailRow
								label='Max OT hours (per day)'
								value={
									schedule?.ot_hours != null && String(schedule.ot_hours).trim() !== ''
										? String(schedule.ot_hours)
										: undefined
								}
							/>
							<DetailRow
								label='Shift hours target'
								value={
									schedule?.shift_hours_target != null &&
									String(schedule.shift_hours_target).trim() !== ''
										? shiftHoursTargetFromApi(schedule.shift_hours_target).label
										: undefined
								}
							/>
							<DetailRow
								label='Minimum target hours'
								value={
									schedule?.minimum_target_hours != null &&
									String(schedule.minimum_target_hours).trim() !== ''
										? String(schedule.minimum_target_hours)
										: undefined
								}
							/>
							<DetailRow label='Notes' value={schedule?.notes} span={2} />
						</div>
					</CardBody>
				</Card>
			</div>
			<div className='col-lg-5'>
				<ScheduleAssignedGroupsSection
					scheduleId={scheduleId ?? schedule?.id}
					groups={schedule?.assigned_groups}
					onChanged={onGroupsChanged}
				/>
			</div>
		</div>
	);
};

export default ScheduleDetails;
