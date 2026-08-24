import React, { useState, useEffect, useMemo, useCallback } from 'react';
import classNames from 'classnames';
import { useParams } from 'react-router-dom';
import { authAxios } from '../../../../axiosInstance';
import Card, { CardBody } from '../../../bootstrap/Card';
import useToasterNotification from '../../../../hooks/useToasterNotification';
import { resolveUserAvatarSource } from '../../../../helpers/functions';
import { mapAccountToTenantRoleSelect } from '../../../../helpers/roleToggleUtils';
import useIsMobile from '../../../../hooks/useIsMobile';
import UserDetailAvatar from './UserDetailAvatar';

const DetailRow = ({ label, value }: { label: string; value?: React.ReactNode }) => (
	<div className='user-detail-card__field'>
		<div className='user-detail-card__label'>{label}</div>
		<div className='user-detail-card__value'>
			{value != null && value !== '' ? value : '—'}
		</div>
	</div>
);

const UserDetails = ({
	userId,
	onLoadComplete,
	fillHeight = false,
}: {
	userId?: string;
	onLoadComplete?: () => void;
	fillHeight?: boolean;
}) => {
	const { id } = useParams();
	const resolvedUserId = userId || id;
	const isMobile = useIsMobile();
	const [user, setUser] = useState<any>(null);
	const [isUserLoading, setIsUserLoading] = useState(true);
	const { showErrorNotification } = useToasterNotification();
	const avatarSource = resolveUserAvatarSource(user);
	const tenantRoleLabel = mapAccountToTenantRoleSelect(user).label;

	const refreshUser = useCallback(() => {
		if (!resolvedUserId) return;
		authAxios
			.get(`/api/hr/accounts/${resolvedUserId}/`)
			.then((response) => setUser(response?.data || null))
			.catch((error) => showErrorNotification(error));
	}, [resolvedUserId, showErrorNotification]);

	const ud = user?.user_data || {};
	const rel = user?.active_relations?.[0];

	const displayName = useMemo(() => {
		if (!user) return '';
		const name = `${user?.first_name || ud?.first_name || ''} ${user?.last_name || ud?.last_name || ''}`.trim();
		return user?.preferred_name || name || user?.email || '';
	}, [user, ud]);

	useEffect(() => {
		if (!resolvedUserId) {
			setIsUserLoading(false);
			setUser(null);
			onLoadComplete?.();
			return undefined;
		}
		let cancelled = false;
		setIsUserLoading(true);
		authAxios
			.get(`/api/hr/accounts/${resolvedUserId}/`)
			.then((response) => {
				if (!cancelled) setUser(response?.data || null);
			})
			.catch((error) => {
				if (!cancelled) showErrorNotification(error);
			})
			.finally(() => {
				if (!cancelled) {
					setIsUserLoading(false);
					onLoadComplete?.();
				}
			});
		return () => {
			cancelled = true;
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [resolvedUserId]);

	if (isUserLoading) {
		return null;
	}

	const departmentValue =
		user?.departments?.map((department: { name: string }) => department.name).join(', ') ||
		rel?.department_name ||
		'—';
	const reportingManager =
		`${user?.reporting_manager?.first_name || ''} ${user?.reporting_manager?.last_name || ''}`.trim() ||
		'—';

	return (
		<Card
			className={classNames(
				'user-detail-card w-100',
				fillHeight && 'h-100 d-flex flex-column',
			)}
			stretch={fillHeight}>
			<CardBody
				className={classNames(
					'user-detail-card__body',
					fillHeight && 'flex-grow-1',
				)}>
				<div className='user-detail-card__hero'>
					{resolvedUserId ? (
						<UserDetailAvatar
							userId={resolvedUserId}
							avatarSource={avatarSource}
							onUpdated={refreshUser}
							size={isMobile ? 72 : 96}
						/>
					) : null}
					<div className='user-detail-card__hero-text'>
						<div className='user-detail-card__name'>{displayName || '—'}</div>
						<div className='user-detail-card__email'>{user?.email || '—'}</div>
						{tenantRoleLabel ? (
							<span className='user-detail-card__role-chip'>{tenantRoleLabel}</span>
						) : null}
					</div>
				</div>

				<div className='user-detail-card__fields'>
					<DetailRow label='First name' value={user?.first_name || ud?.first_name} />
					<DetailRow label='Last name' value={user?.last_name || ud?.last_name} />
					<DetailRow label='Email' value={user?.email} />
					<DetailRow label='Gender' value={user?.gender} />
					<DetailRow label='Date of birth' value={user?.dob} />
					<DetailRow label='Personal contact' value={user?.personal_contact_number} />
					<DetailRow
						label='Office contact'
						value={user?.office_contact_number || ud?.user_contact_phone}
					/>
					<DetailRow label='Role' value={tenantRoleLabel} />
					<DetailRow label='Department' value={departmentValue} />
					<DetailRow label='Site' value={user?.site?.name || rel?.site_name} />
					<DetailRow label='Designation' value={rel?.designation} />
					<DetailRow label='Reporting manager' value={reportingManager} />
				</div>
			</CardBody>
		</Card>
	);
};

export default UserDetails;
