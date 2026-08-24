import React, { useEffect, useState } from 'react';
import classNames from 'classnames';
import dayjs from 'dayjs';
import { authAxios } from '../../../../axiosInstance';
import Card, { CardBody, CardHeader, CardLabel, CardTitle } from '../../../bootstrap/Card';
import CustomSpinner from '../../../CustomSpinner/CustomSpinner';

type UserGroup = {
	id?: number;
	name?: string;
	added_by?: { name?: string; first_name?: string; last_name?: string };
	added_on?: string;
};

type Props = { userId?: string; fillHeight?: boolean };

const addedByName = (group: UserGroup) => {
	const addedBy = group?.added_by;
	if (!addedBy) return '';
	if (addedBy.name) return addedBy.name;
	return [addedBy.first_name, addedBy.last_name].filter(Boolean).join(' ').trim();
};

const UserGroupsCard = ({ userId, fillHeight = false }: Props) => {
	const [groups, setGroups] = useState<UserGroup[]>([]);
	const [loading, setLoading] = useState(false);

	useEffect(() => {
		if (!userId) return undefined;
		let cancelled = false;
		setLoading(true);
		authAxios
			.get(`/api/hr/accounts/${userId}/`)
			.then((res) => {
				if (!cancelled) {
					const list = Array.isArray(res.data?.groups) ? res.data.groups : [];
					setGroups(list);
				}
			})
			.finally(() => {
				if (!cancelled) setLoading(false);
			});
		return () => {
			cancelled = true;
		};
	}, [userId]);

	return (
		<Card
			className={classNames(
				'user-groups-card w-100',
				fillHeight && 'h-100 d-flex flex-column',
			)}
			stretch={fillHeight}>
			<CardHeader className='user-groups-card__header'>
				<CardLabel icon='Groups' iconColor='warning'>
					<CardTitle tag='div' className='h5 text-warning mb-0'>
						Groups
					</CardTitle>
				</CardLabel>
			</CardHeader>
			<CardBody className={fillHeight ? 'd-flex flex-column flex-grow-1' : undefined}>
				{loading ? (
					<div className='d-flex justify-content-center py-4'>
						<CustomSpinner />
					</div>
				) : groups.length > 0 ? (
					<ul className='user-groups-card__list mb-0'>
						{groups.map((group) => {
							const addedBy = addedByName(group);
							const addedOn = group.added_on
								? dayjs(group.added_on).format('MMM D, YYYY')
								: '';
							return (
								<li key={group.id ?? group.name} className='user-groups-card__item'>
									<div className='user-groups-card__item-name'>{group.name || '—'}</div>
									{addedBy || addedOn ? (
										<div className='user-groups-card__item-meta'>
											{[addedBy && `Added by ${addedBy}`, addedOn && `on ${addedOn}`]
												.filter(Boolean)
												.join(' ')}
										</div>
									) : null}
								</li>
							);
						})}
					</ul>
				) : (
					<div
						className={classNames(
							'd-flex w-100 align-items-center justify-content-center text-center',
							fillHeight && 'flex-grow-1',
						)}>
						<p className='text-muted mb-0 small'>No groups assigned to this user.</p>
					</div>
				)}
			</CardBody>
		</Card>
	);
};

export default UserGroupsCard;
