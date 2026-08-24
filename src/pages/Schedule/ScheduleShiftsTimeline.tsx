import React, { useMemo } from 'react';
import Card, {
	CardBody,
	CardHeader,
	CardLabel,
	CardTitle,
} from '../../components/bootstrap/Card';
import useIsMobile from '../../hooks/useIsMobile';

type Shift = {
	id?: number | string;
	name?: string;
	shift_name?: string;
	start_time?: string;
	end_time?: string;
};

type ScheduleShiftsTimelineProps = {
	shifts?: Shift[];
};

const SHIFT_COLORS = ['#3174ad', '#198754', '#fd7e14', '#6f42c1', '#0d6efd', '#d63384', '#0f6d7a'];

const parseTimeToMinutes = (raw?: string): number | null => {
	if (raw == null) return null;
	const s = String(raw).trim();
	if (!s) return null;
	const [hPart, mPart] = s.split(':');
	const h = Number(hPart);
	const m = Number(mPart ?? 0);
	if (Number.isNaN(h) || Number.isNaN(m)) return null;
	return h * 60 + m;
};

const formatTime = (raw?: string) => {
	const mins = parseTimeToMinutes(raw);
	if (mins == null) return '—';
	const h = Math.floor(mins / 60) % 24;
	const m = mins % 60;
	const hh = String(h).padStart(2, '0');
	const mm = String(m).padStart(2, '0');
	return `${hh}:${mm}`;
};

const formatDuration = (start?: string, end?: string) => {
	const sm = parseTimeToMinutes(start);
	const em = parseTimeToMinutes(end);
	if (sm == null || em == null) return '—';
	let diff = em - sm;
	if (diff <= 0) diff += 24 * 60;
	const h = Math.floor(diff / 60);
	const m = diff % 60;
	if (m === 0) return `${h}h`;
	return `${h}h ${m}m`;
};

const formatHourLabel = (h: number, compact: boolean) => {
	if (h === 24) return compact ? '24' : '24:00';
	return compact ? String(h) : `${String(h).padStart(2, '0')}:00`;
};

const ScheduleShiftsTimeline = ({ shifts }: ScheduleShiftsTimelineProps) => {
	const isMobile = useIsMobile();
	const list = useMemo(
		() => (Array.isArray(shifts) ? shifts.filter(Boolean) : []),
		[shifts],
	);

	const hourLabels = useMemo(() => {
		const step = isMobile ? 4 : 1;
		const labels: number[] = [];
		for (let h = 0; h <= 24; h += step) labels.push(h);
		if (labels[labels.length - 1] !== 24) labels.push(24);
		return labels;
	}, [isMobile]);

	if (list.length === 0) return null;

	const totalMinutes = 24 * 60;
	const barHeight = isMobile ? 10 : 12;

	const renderHourAxis = (keyPrefix: string) => (
		<div className='schedule-shifts-timeline__axis'>
			{hourLabels.map((h) => (
				<div
					key={`${keyPrefix}-${h}`}
					className='schedule-shifts-timeline__hour'
					style={{ left: `${(h / 24) * 100}%` }}>
					{formatHourLabel(h, isMobile)}
				</div>
			))}
		</div>
	);

	return (
		<Card className='schedule-shifts-timeline'>
			<CardHeader>
				<CardLabel icon='AccessTime' iconColor='warning'>
					<CardTitle tag='div' className='h5'>
						Shifts
					</CardTitle>
				</CardLabel>
			</CardHeader>
			<CardBody>
				<div className='schedule-shifts-timeline__list'>
					{!isMobile ? (
						<div className='schedule-shifts-timeline__axis-row'>
							<div className='schedule-shifts-timeline__label-spacer' aria-hidden />
							{renderHourAxis('desktop')}
						</div>
					) : null}

					{list.map((shift, idx) => {
						const startMin = parseTimeToMinutes(shift?.start_time);
						const endMin = parseTimeToMinutes(shift?.end_time);
						const color = SHIFT_COLORS[idx % SHIFT_COLORS.length];
						const label = shift?.name || shift?.shift_name || `Shift ${shift?.id ?? idx + 1}`;

						const segments: { left: number; width: number }[] = [];
						if (startMin != null && endMin != null) {
							if (endMin > startMin) {
								segments.push({
									left: (startMin / totalMinutes) * 100,
									width: ((endMin - startMin) / totalMinutes) * 100,
								});
							} else {
								segments.push({
									left: (startMin / totalMinutes) * 100,
									width: ((totalMinutes - startMin) / totalMinutes) * 100,
								});
								segments.push({ left: 0, width: (endMin / totalMinutes) * 100 });
							}
						}

						return (
							<div
								key={shift?.id ?? `${label}-${idx}`}
								className='schedule-shifts-timeline__row'>
								<div className='schedule-shifts-timeline__meta'>
									<div className='schedule-shifts-timeline__name' title={label}>
										<span
											className='schedule-shifts-timeline__swatch'
											style={{ background: color }}
											aria-hidden
										/>
										{label}
									</div>
									<div className='schedule-shifts-timeline__range'>
										{formatTime(shift?.start_time)} – {formatTime(shift?.end_time)}
										<span className='schedule-shifts-timeline__duration'>
											{formatDuration(shift?.start_time, shift?.end_time)}
										</span>
									</div>
								</div>
								<div className='schedule-shifts-timeline__track-wrap'>
									<div
										className='schedule-shifts-timeline__track'
										style={{ height: barHeight }}>
										{segments.map((seg, i) => (
											<div
												key={`${shift?.id ?? idx}-seg-${i}`}
												className='schedule-shifts-timeline__segment'
												style={{
													left: `${seg.left}%`,
													width: `${Math.max(seg.width, 1.2)}%`,
													background: color,
												}}
											/>
										))}
										{Array.from({ length: isMobile ? 5 : 23 }).map((_, tickIdx) => {
											const h = isMobile ? (tickIdx + 1) * 4 : tickIdx + 1;
											return (
												<div
													key={`tick-${shift?.id ?? idx}-${h}`}
													className='schedule-shifts-timeline__tick'
													style={{ left: `${(h / 24) * 100}%` }}
												/>
											);
										})}
									</div>
								</div>
							</div>
						);
					})}

					{isMobile ? (
						<div className='schedule-shifts-timeline__axis-row schedule-shifts-timeline__axis-row--below'>
							{renderHourAxis('mobile')}
						</div>
					) : null}
				</div>
			</CardBody>
		</Card>
	);
};

export default ScheduleShiftsTimeline;
