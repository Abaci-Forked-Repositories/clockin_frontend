import React from 'react';
import PropTypes from 'prop-types';
import { Spinner } from 'reactstrap';
import FormGroup from '../../../components/bootstrap/forms/FormGroup';
import ReactSelectComponent from '../../../components/CustomComponent/Select/ReactSelectComponent';
import { formatMinutesToHms } from '../../Attendance/attendanceStatusUtils';

type CompOffWorkSummary = {
	ot_mins_total: number | null;
	extra_worked_mins_total: number | null;
};

type CompOffCreditFieldsProps = {
	register: any;
	control: any;
	getValues: any;
	errors: any;
	userOptions: { label: string; value: number | string }[];
	workSummary?: CompOffWorkSummary | null;
	workSummaryLoading?: boolean;
};

const formatSummaryMinutes = (value: number | null | undefined) => {
	const n = Number(value);
	if (!Number.isFinite(n) || n < 0) return '----';
	return formatMinutesToHms(n);
};

const CompOffCreditFields = ({
	register,
	control,
	getValues,
	errors,
	userOptions,
	workSummary = null,
	workSummaryLoading = false,
}: CompOffCreditFieldsProps) => (
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

		{(workSummaryLoading || workSummary) && (
			<div className='col-12'>
				<div
					className='rounded p-3'
					style={{ backgroundColor: 'var(--bs-light, #f8f9fa)' }}>
					{workSummaryLoading ? (
						<div className='d-flex align-items-center gap-2 text-muted'>
							<Spinner size='sm' />
							<span>Loading work summary…</span>
						</div>
					) : (
						<div className='row g-2'>
							<div className='col-md-6'>
								<div className='small text-muted mb-1'>OT total</div>
								<div className='fw-semibold'>
									{formatSummaryMinutes(workSummary?.ot_mins_total)}
								</div>
							</div>
							<div className='col-md-6'>
								<div className='small text-muted mb-1'>Extra worked total</div>
								<div className='fw-semibold'>
									{formatSummaryMinutes(workSummary?.extra_worked_mins_total)}
								</div>
							</div>
						</div>
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

		<div className='col-md-6'>
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

CompOffCreditFields.propTypes = {
	register: PropTypes.func.isRequired,
	control: PropTypes.object.isRequired,
	getValues: PropTypes.func.isRequired,
	errors: PropTypes.object.isRequired,
	userOptions: PropTypes.array.isRequired,
	workSummary: PropTypes.shape({
		ot_mins_total: PropTypes.number,
		extra_worked_mins_total: PropTypes.number,
	}),
	workSummaryLoading: PropTypes.bool,
};

CompOffCreditFields.defaultProps = {
	workSummary: null,
	workSummaryLoading: false,
};

export default CompOffCreditFields;
