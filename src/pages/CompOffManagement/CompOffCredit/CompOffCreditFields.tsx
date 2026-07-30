import React from 'react';
import PropTypes from 'prop-types';
import { Spinner } from 'reactstrap';
import FormGroup from '../../../components/bootstrap/forms/FormGroup';
import ReactSelectComponent from '../../../components/CustomComponent/Select/ReactSelectComponent';
import useDarkMode from '../../../hooks/useDarkMode';
import { formatMinutesToHms } from '../../Attendance/attendanceStatusUtils';
import { FISCAL_MONTH_OPTIONS } from '../../Settings/companyHrSettingsUtils';

export type CompOffWorkSummary = {
	month: number | null;
	year: number | null;
	ot_mins_total: number | null;
	extra_worked_mins_total: number | null;
	extra_working_days: number | null;
	ot_days_count: number | null;
};

type CompOffCreditFieldsProps = {
	register: any;
	control: any;
	getValues: any;
	errors: any;
	userOptions: { label: string; value: number | string }[];
	selectedUserId?: number | null;
	summaryMonth: number;
	summaryYear: number;
	onSummaryMonthChange: (month: number) => void;
	onSummaryYearChange: (year: number) => void;
	workSummary?: CompOffWorkSummary | null;
	workSummaryLoading?: boolean;
};

const formatSummaryMinutes = (value: number | null | undefined) => {
	const n = Number(value);
	if (!Number.isFinite(n) || n < 0) return '----';
	return formatMinutesToHms(n);
};

const formatPeriodLabel = (month: number | null | undefined, year: number | null | undefined) => {
	const monthLabel =
		FISCAL_MONTH_OPTIONS.find((item) => item.value === Number(month))?.label ?? '';
	const yearLabel = year != null ? String(year) : '';
	if (monthLabel && yearLabel) return `${monthLabel} ${yearLabel}`;
	if (yearLabel) return yearLabel;
	return '----';
};

const buildYearOptions = (centerYear: number) =>
	Array.from({ length: 7 }, (_, index) => centerYear - 3 + index);

const labelStyle = (muted: string) => ({
	fontSize: '0.7rem',
	fontWeight: 600,
	letterSpacing: '0.06em',
	textTransform: 'uppercase' as const,
	color: muted,
	marginBottom: 4,
});

const CompOffCreditFields = ({
	register,
	control,
	getValues,
	errors,
	userOptions,
	selectedUserId = null,
	summaryMonth,
	summaryYear,
	onSummaryMonthChange,
	onSummaryYearChange,
	workSummary = null,
	workSummaryLoading = false,
}: CompOffCreditFieldsProps) => {
	const { darkModeStatus } = useDarkMode();
	const showWorkSummary = selectedUserId != null;
	const periodLabel = formatPeriodLabel(
		workSummary?.month ?? summaryMonth,
		workSummary?.year ?? summaryYear,
	);
	const yearOptions = buildYearOptions(summaryYear);

	const textPrimary = darkModeStatus ? '#f8f9fa' : '#111827';
	const textMuted = darkModeStatus ? '#9ca3af' : '#6b7280';
	const textSubtle = darkModeStatus ? '#6b7280' : '#9ca3af';
	const surface = darkModeStatus ? 'rgba(255,255,255,0.06)' : '#f3f4f6';
	const cardBg = darkModeStatus ? 'rgba(255,255,255,0.04)' : '#ffffff';
	const border = darkModeStatus ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)';

	return (
		<div className='row g-3'>
			<div className='col-12'>
				<ReactSelectComponent
					control={control}
					name='User *'
					field_name='user'
					getValues={getValues}
					errors={errors}
					options={userOptions}
					isRequired
				/>
			</div>

			{showWorkSummary && (
				<div className='col-12'>
					<div
						className='rounded-3 p-3 p-md-4'
						style={{
							backgroundColor: surface,
							border: `1px solid ${border}`,
						}}>
						{workSummaryLoading ? (
							<div className='d-flex align-items-center justify-content-center py-3'>
								<Spinner size='sm' />
							</div>
						) : (
							<>
								<div style={labelStyle(textSubtle)}>Work summary</div>

								<div className='row g-3 align-items-end mb-3'>
									<div className='col-6 col-md-4'>
										<FormGroup label='Month'>
											<select
												className='form-select'
												style={{ height: '40px' }}
												aria-label='Summary month'
												value={summaryMonth}
												onChange={(event) =>
													onSummaryMonthChange(Number(event.target.value))
												}>
												{FISCAL_MONTH_OPTIONS.map((month) => (
													<option key={month.value} value={month.value}>
														{month.label}
													</option>
												))}
											</select>
										</FormGroup>
									</div>
									<div className='col-6 col-md-4'>
										<FormGroup label='Year'>
											<select
												className='form-select'
												style={{ height: '40px' }}
												aria-label='Summary year'
												value={summaryYear}
												onChange={(event) =>
													onSummaryYearChange(Number(event.target.value))
												}>
												{yearOptions.map((year) => (
													<option key={year} value={year}>
														{year}
													</option>
												))}
											</select>
										</FormGroup>
									</div>
									<div className='col-md-4'>
										<div style={labelStyle(textSubtle)}>Period</div>
										<div
											style={{
												color: textPrimary,
												fontWeight: 600,
												fontSize: '1rem',
												minHeight: 40,
												lineHeight: '40px',
											}}>
											{periodLabel}
										</div>
									</div>
								</div>

								{workSummary ? (
									<div className='row g-3'>
										<div className='col-md-6'>
											<div
												className='rounded-3 p-3 h-100'
												style={{
													backgroundColor: cardBg,
													border: `1px solid ${border}`,
												}}>
												<div style={labelStyle(textSubtle)}>OT total</div>
												<div
													style={{
														color: textPrimary,
														fontWeight: 700,
														fontSize: '1rem',
													}}>
													{formatSummaryMinutes(workSummary.ot_mins_total)}
												</div>
											</div>
										</div>
										<div className='col-md-6'>
											<div
												className='rounded-3 p-3 h-100'
												style={{
													backgroundColor: cardBg,
													border: `1px solid ${border}`,
												}}>
												<div style={labelStyle(textSubtle)}>Extra worked total</div>
												<div
													style={{
														color: textPrimary,
														fontWeight: 700,
														fontSize: '1rem',
													}}>
													{formatSummaryMinutes(workSummary.extra_worked_mins_total)}
												</div>
											</div>
										</div>
									</div>
								) : (
									<p
										className='mb-0 text-center py-3'
										style={{ color: textMuted, fontSize: '0.9rem' }}>
										No work summary available for this period.
									</p>
								)}
							</>
						)}
					</div>
				</div>
			)}

			<div className='col-md-6'>
				<FormGroup label='Earned date *'>
					<input
						type='date'
						{...register('earned_date', { required: true })}
						className='form-control'
						style={{ height: '40px' }}
					/>
					{errors?.earned_date?.type ? (
						<span style={{ color: 'red' }}>*This field is required</span>
					) : (
						<p />
					)}
				</FormGroup>
			</div>

			<div className='col-md-6'>
				<FormGroup label='Expiry date *'>
					<input
						type='date'
						{...register('expiry_date', { required: true })}
						className='form-control'
						style={{ height: '40px' }}
					/>
					{errors?.expiry_date?.type ? (
						<span style={{ color: 'red' }}>*This field is required</span>
					) : (
						<p />
					)}
				</FormGroup>
			</div>

			<div className='col-md-12'>
				<FormGroup label='Days *'>
					<input
						type='number'
						step='0.5'
						min='0.5'
						{...register('days', {
							required: true,
							min: 0.5,
							validate: (value: string | number) => {
								const n = Number(value);
								return !Number.isNaN(n) && n > 0;
							},
						})}
						className='form-control'
						style={{ height: '40px' }}
						placeholder='e.g. 2.0'
					/>
					{errors?.days?.type ? (
						<span style={{ color: 'red' }}>*Enter a valid number of days</span>
					) : (
						<p />
					)}
				</FormGroup>
			</div>

			<div className='col-12'>
				<FormGroup label='Remarks'>
					<textarea
						{...register('remarks')}
						className='form-control'
						rows={3}
						placeholder='e.g. Weekend double shift'
					/>
				</FormGroup>
			</div>
		</div>
	);
};

CompOffCreditFields.propTypes = {
	register: PropTypes.func.isRequired,
	control: PropTypes.object.isRequired,
	getValues: PropTypes.func.isRequired,
	errors: PropTypes.object.isRequired,
	userOptions: PropTypes.array.isRequired,
	selectedUserId: PropTypes.number,
	summaryMonth: PropTypes.number.isRequired,
	summaryYear: PropTypes.number.isRequired,
	onSummaryMonthChange: PropTypes.func.isRequired,
	onSummaryYearChange: PropTypes.func.isRequired,
	workSummary: PropTypes.shape({
		month: PropTypes.number,
		year: PropTypes.number,
		ot_mins_total: PropTypes.number,
		extra_worked_mins_total: PropTypes.number,
		extra_working_days: PropTypes.number,
		ot_days_count: PropTypes.number,
	}),
	workSummaryLoading: PropTypes.bool,
};

CompOffCreditFields.defaultProps = {
	selectedUserId: null,
	workSummary: null,
	workSummaryLoading: false,
};

export default CompOffCreditFields;
