import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import Select from 'react-select';
import { Col, FormGroup, Label, ButtonGroup } from 'reactstrap';
import Dropdown, {
	DropdownItem,
	DropdownMenu,
	DropdownToggle,
} from '../../components/bootstrap/Dropdown';
import Modal, { ModalBody, ModalFooter, ModalHeader, ModalTitle } from '../../components/bootstrap/Modal';
import Button from '../../components/bootstrap/Button';
import Spinner from '../../components/bootstrap/Spinner';
import useToasterNotification from '../../hooks/useToasterNotification';
import downloadHandler from '../../helpers/DownloadCsv';
import {
	buildAttendanceConsolidatedExportUrl,
	buildAttendanceExportUrl,
	hrExportFileName,
	type HrExportFormat,
} from '../../helpers/hrExportUtils';
import useDarkMode from '../../hooks/useDarkMode';
import useSelectStyles from '../../hooks/useSelectStyle';
import { authAxios } from '../../axiosInstance';

type AttendanceExportReportType = 'detailed' | 'consolidated';

type SelectOption = {
	label: string;
	value: number | string;
};

type AttendanceExportButtonProps = {
	url: React.MutableRefObject<string | undefined>;
	name?: string;
};

const REPORT_OPTIONS: {
	type: AttendanceExportReportType;
	label: string;
	fileLabel: string;
	modalTitle: string;
}[] = [
	{
		type: 'detailed',
		label: 'Detailed',
		fileLabel: 'Attendance Detailed',
		modalTitle: 'Export detailed attendance',
	},
	{
		type: 'consolidated',
		label: 'Consolidated',
		fileLabel: 'Attendance Consolidated',
		modalTitle: 'Export consolidated attendance',
	},
];

const FORMAT_OPTIONS: { value: HrExportFormat; label: string }[] = [
	{ value: 'csv', label: 'CSV' },
	{ value: 'xlsx', label: 'XLSX' },
];

const getFormatOptions = (type: AttendanceExportReportType) =>
	type === 'consolidated'
		? FORMAT_OPTIONS.filter((option) => option.value === 'xlsx')
		: FORMAT_OPTIONS;

const buildExportUrl = (
	reportType: AttendanceExportReportType,
	listUrl: string | undefined,
	options: {
		exportFormat: HrExportFormat;
		fromDate: string;
		toDate: string;
		userId?: string | number | null;
		groupId?: string | number | null;
	},
) =>
	reportType === 'consolidated'
		? buildAttendanceConsolidatedExportUrl(listUrl, options)
		: buildAttendanceExportUrl(listUrl, options);

const toList = (data: unknown): any[] => {
	if (Array.isArray(data)) return data;
	if (data != null && typeof data === 'object' && Array.isArray((data as any).results)) {
		return (data as any).results;
	}
	return [];
};

const mapUserOption = (item: any): SelectOption => ({
	label:
		`${item?.preferred_name || ''}`.trim() ||
		`${item?.first_name || ''} ${item?.last_name || ''}`.trim() ||
		item?.email ||
		`User ${item?.id}`,
	value: item?.id,
});

const mapGroupOption = (item: any): SelectOption => ({
	label: item?.name || `Group ${item?.id}`,
	value: item?.id,
});

const AttendanceExportButton = ({
	url,
	name = 'Attendance',
}: AttendanceExportButtonProps) => {
	const { darkModeStatus } = useDarkMode();
	const selectStyles = useSelectStyles(false);
	const { showErrorNotification } = useToasterNotification();
	const [isLoading, setIsLoading] = useState(false);
	const [isModalShow, setIsModalShow] = useState(false);
	const [optionsLoading, setOptionsLoading] = useState(false);
	const [reportType, setReportType] = useState<AttendanceExportReportType>('detailed');
	const [selectedFormat, setSelectedFormat] = useState<HrExportFormat>('csv');
	const [date, setDate] = useState<{ from_date?: string; to_date?: string } | null>(null);
	const [selectedUser, setSelectedUser] = useState<SelectOption | null>(null);
	const [selectedGroup, setSelectedGroup] = useState<SelectOption | null>(null);
	const [userOptions, setUserOptions] = useState<SelectOption[]>([]);
	const [groupOptions, setGroupOptions] = useState<SelectOption[]>([]);
	const [error, setError] = useState<string | null>(null);

	const activeReport =
		REPORT_OPTIONS.find((option) => option.type === reportType) || REPORT_OPTIONS[0];
	const formatOptions = getFormatOptions(reportType);

	useEffect(() => {
		if (!isModalShow) return undefined;
		if (userOptions.length && groupOptions.length) return undefined;

		let cancelled = false;
		setOptionsLoading(true);
		Promise.all([
			authAxios.get('api/hr/accounts/', { params: { paginate: 'off' } }),
			authAxios.get('api/hr/groups/', { params: { paginate: 'off' } }),
		])
			.then(([usersRes, groupsRes]) => {
				if (cancelled) return;
				setUserOptions(toList(usersRes?.data).map(mapUserOption));
				setGroupOptions(toList(groupsRes?.data).map(mapGroupOption));
			})
			.catch((err) => {
				if (!cancelled) showErrorNotification(err);
			})
			.finally(() => {
				if (!cancelled) setOptionsLoading(false);
			});

		return () => {
			cancelled = true;
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [isModalShow]);

	const openReportModal = (type: AttendanceExportReportType) => {
		setReportType(type);
		setSelectedFormat(type === 'consolidated' ? 'xlsx' : 'csv');
		setDate(null);
		setSelectedUser(null);
		setSelectedGroup(null);
		setError(null);
		setIsModalShow(true);
	};

	const setQuickRange = (fromDate: string, toDate: string) => {
		setDate({ from_date: fromDate, to_date: toDate });
		setError(null);
	};

	const dateChangeHandler = (value: string, key: 'from_date' | 'to_date') => {
		setDate((prev) => {
			const updatedDate = { ...prev, [key]: value };

			if (key === 'from_date') {
				updatedDate.to_date = '';
			}

			if (updatedDate.from_date && updatedDate.to_date) {
				const startDate = moment(updatedDate.from_date, 'YYYY-MM-DD');
				const endDate = moment(updatedDate.to_date, 'YYYY-MM-DD');
				if (endDate.isBefore(startDate)) {
					setError('End date must be on or after start date.');
					return prev;
				}
			}

			setError(null);
			return updatedDate;
		});
	};

	const handleExport = () => {
		const fromDate = date?.from_date;
		const toDate = date?.to_date;

		if (!fromDate || !toDate) {
			showErrorNotification('Please select a date range');
			return;
		}

		setIsLoading(true);
		const exportFormat: HrExportFormat =
			reportType === 'consolidated' ? 'xlsx' : selectedFormat;
		const exportUrl = buildExportUrl(reportType, url.current, {
			exportFormat,
			fromDate,
			toDate,
			userId: selectedUser?.value ?? null,
			groupId: selectedGroup?.value ?? null,
		});
		const fileName = hrExportFileName(
			`${activeReport.fileLabel || name}`,
			exportFormat,
		);
		downloadHandler(exportUrl, fileName, setIsLoading);
	};

	const canGenerate = Boolean(date?.from_date && date?.to_date && !error);
	const buttonColor = darkModeStatus ? 'light' : 'dark';

	return (
		<>
			<Dropdown>
				<DropdownToggle hasIcon>
					<Button
						icon='Download'
						color={buttonColor}
						isLight
						isDisable={isLoading}>
						{isLoading ? <Spinner isSmall color='secondary' /> : 'Export'}
					</Button>
				</DropdownToggle>
				<DropdownMenu isAlignmentEnd size='sm'>
					{REPORT_OPTIONS.map((option) => (
						<DropdownItem key={option.type}>
							<Button
								className='w-100 text-start'
								onClick={() => openReportModal(option.type)}>
								{option.label}
							</Button>
						</DropdownItem>
					))}
				</DropdownMenu>
			</Dropdown>

			{isModalShow && (
				<Modal isOpen={isModalShow} setIsOpen={setIsModalShow}>
					<ModalHeader className='p-4' setIsOpen={setIsModalShow}>
						<ModalTitle id='attendance-export-modal'>
							{activeReport.modalTitle}
						</ModalTitle>
					</ModalHeader>
					<ModalBody className='px-5 pb-2 d-flex flex-column gap-3'>
						<div className='col-12'>
							<div className='form-group mb-0'>
								<label htmlFor='attendance-export-format' className='form-label'>
									Format *
								</label>
								<div className='d-flex gap-4 align-items-center'>
									{formatOptions.map(({ value, label }) => (
										<div key={value} className='d-flex align-items-center gap-2'>
											<input
												type='radio'
												id={`attendance-export-${value}`}
												name='attendance-export-format'
												value={value}
												checked={selectedFormat === value}
												onChange={() => setSelectedFormat(value)}
												className='form-check-input'
											/>
											<label
												htmlFor={`attendance-export-${value}`}
												className='form-check-label'
												style={{ marginTop: '4px' }}>
												{label}
											</label>
										</div>
									))}
								</div>
							</div>
						</div>

						<FormGroup className='mb-0'>
							<Label>User</Label>
							<Select
								className='react-select'
								placeholder={optionsLoading ? 'Loading users...' : 'All users'}
								styles={selectStyles}
								options={userOptions}
								value={selectedUser}
								isClearable
								isDisabled={optionsLoading}
								onChange={(option) => setSelectedUser(option as SelectOption | null)}
							/>
						</FormGroup>

						<FormGroup className='mb-0'>
							<Label>Group</Label>
							<Select
								className='react-select'
								placeholder={optionsLoading ? 'Loading groups...' : 'All groups'}
								styles={selectStyles}
								options={groupOptions}
								value={selectedGroup}
								isClearable
								isDisabled={optionsLoading}
								onChange={(option) => setSelectedGroup(option as SelectOption | null)}
							/>
						</FormGroup>

						<div>
							<Label>Quick Selection</Label>
							<ButtonGroup className='d-flex gap-2 mb-2'>
								{[
									{
										label: 'Today',
										from: moment().format('YYYY-MM-DD'),
										to: moment().format('YYYY-MM-DD'),
									},
									{
										label: 'Yesterday',
										from: moment().subtract(1, 'days').format('YYYY-MM-DD'),
										to: moment().subtract(1, 'days').format('YYYY-MM-DD'),
									},
									{
										label: '7 Days',
										from: moment().subtract(7, 'days').format('YYYY-MM-DD'),
										to: moment().format('YYYY-MM-DD'),
									},
									{
										label: '30 Days',
										from: moment().subtract(30, 'days').format('YYYY-MM-DD'),
										to: moment().format('YYYY-MM-DD'),
									},
								].map(({ label, from, to }) => (
									<Button
										key={label}
										color='secondary'
										isLight
										onClick={() => setQuickRange(from, to)}>
										{label}
									</Button>
								))}
							</ButtonGroup>
						</div>

						<FormGroup style={{ marginBottom: '5px' }}>
							<Label for='attendance-export-from-date'>From date *</Label>
							<Col>
								<input
									placeholder='From date'
									type='date'
									id='attendance-export-from-date'
									className='form-control input-style'
									value={date?.from_date || ''}
									max={new Date().toISOString().split('T')[0]}
									onChange={(e) => dateChangeHandler(e.target.value, 'from_date')}
								/>
							</Col>
						</FormGroup>
						<FormGroup style={{ marginBottom: '5px' }}>
							<Label for='attendance-export-to-date'>To date *</Label>
							<Col>
								<input
									placeholder='To date'
									id='attendance-export-to-date'
									type='date'
									value={date?.to_date || ''}
									min={
										date?.from_date
											? new Date(date.from_date).toISOString().split('T')[0]
											: ''
									}
									max={new Date().toISOString().split('T')[0]}
									disabled={!date?.from_date}
									className='form-control input-style mb-3'
									onChange={(e) => dateChangeHandler(e.target.value, 'to_date')}
								/>
							</Col>
							{error ? (
								<b className='text-danger' style={{ marginTop: '10px' }}>
									{error}
								</b>
							) : null}
						</FormGroup>
					</ModalBody>
					<ModalFooter className='px-4 pb-4'>
						<Button
							icon='Download'
							style={{ marginRight: '20px', marginTop: '8px' }}
							color='secondary'
							isLight
							isDisable={!canGenerate || isLoading}
							onClick={() => {
								setIsModalShow(false);
								handleExport();
							}}>
							Generate
						</Button>
					</ModalFooter>
				</Modal>
			)}
		</>
	);
};

AttendanceExportButton.propTypes = {
	url: PropTypes.shape({ current: PropTypes.string }).isRequired,
	name: PropTypes.string,
};

AttendanceExportButton.defaultProps = {
	name: 'Attendance',
};

export default AttendanceExportButton;
