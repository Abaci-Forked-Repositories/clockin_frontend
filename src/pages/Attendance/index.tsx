import React, { useContext, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import SubHeader, { SubHeaderLeft, SubHeaderRight } from '../../layout/SubHeader/SubHeader';
import Card, { CardBody, CardHeader, CardLabel, CardTitle } from '../../components/bootstrap/Card';
import PageWrapper from '../../layout/PageWrapper/PageWrapper';
import AddButton from '../../components/CustomComponent/Buttons/AddButton';
import AttendanceExportButton from './AttendanceExportButton';
import AttendanceTable from './AttendanceTable';
import AddAttendance from './AddAttendance';
import AuthContext from '../../contexts/authContext';
import {
	isSelfEquivalentMode,
	isPrivilegedToggleMode,
	isAdminOrHrToggleMode,
} from '../../helpers/roleToggleUtils';

const Index = () => {
	const { userData } = useContext(AuthContext);
	const accountToggle = useSelector((state: any) => state.authSlice?.account_toggle_button);
	const mode = accountToggle === 'Self' ? 'Self' : 'Admin';
	const tableRef = useRef();
	const urlBackup = useRef<string | undefined>(undefined);
	const [attendanceModalShow, setAttendanceModalShow] = useState(false);
	const [editId, setEditId] = useState<any>(null);
	const canAddOrEditAttendance = isAdminOrHrToggleMode(userData, mode);
	const showAddAttendance = isSelfEquivalentMode(userData, mode) || canAddOrEditAttendance;
	const showExport = isPrivilegedToggleMode(userData, mode);

	const openAddModal = (state: boolean) => {
		if (state && !showAddAttendance) return;
		if (state) setEditId(null);
		setAttendanceModalShow(state);
	};

	const editModalToggle = (id: any) => {
		if (!canAddOrEditAttendance) return;
		setEditId(id);
		setAttendanceModalShow(true);
	};

	return (
		<>
			{attendanceModalShow && (
				<AddAttendance
					isOpen={attendanceModalShow}
					setIsOpen={setAttendanceModalShow}
					tableRef={tableRef}
					title={editId ? 'Edit Attendance' : 'Add Attendance'}
					id={editId}
					url='/api/users/clock/portal/'
				/>
			)}
			<PageWrapper title='Attendance'>
				<SubHeader>
					<SubHeaderLeft>
						<CardTitle tag='div' className='h5'>
							Attendance
						</CardTitle>
					</SubHeaderLeft>
					<SubHeaderRight>
						{showAddAttendance && (
							<AddButton modalShow={openAddModal} name='Add Attendance' />
						)}
						{showExport && <AttendanceExportButton url={urlBackup} name='Attendance' />}
					</SubHeaderRight>
				</SubHeader>
				<Card stretch>
					<CardHeader borderSize={1}>
						<CardLabel icon='' iconColor='info'>
							<CardTitle tag='div' className='h5'>
								<p />
							</CardTitle>
						</CardLabel>
					</CardHeader>
					<CardBody className='table-responsive'>
						<p />
						<AttendanceTable
							tableRef={tableRef}
							urlBackup={urlBackup}
							editModalToggle={editModalToggle}
						/>
					</CardBody>
				</Card>
			</PageWrapper>
		</>
	);
};

export default Index;
