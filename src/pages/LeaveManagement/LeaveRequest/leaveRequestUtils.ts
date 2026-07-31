export type LeaveRequestAction = 'approve' | 'reject' | 'cancel';

export const leaveRequestActionUrl = (
	id: number | string,
	action: LeaveRequestAction,
): string => `/api/hr/leave-requests/${id}/${action}/`;
