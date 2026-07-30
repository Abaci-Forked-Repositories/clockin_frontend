import React, { useCallback, useEffect, useRef, useState } from 'react';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import classNames from 'classnames';
import ImageCell from '../../components/CustomComponent/Imagecell';
import Popovers from '../../components/bootstrap/Popovers';
import { formatClockinStatusLabel } from '../Site/SiteDetails/siteAttendanceUtils';

export type ScheduledUser = {
	id: number;
	first_name?: string;
	last_name?: string;
	avatar?: string | null;
	/** `CLOCK_IN` | `CLOCK_OUT` | null when not yet clocked */
	clockin_status?: string | null;
};

/** @deprecated Prefer ScheduledUser — kept for existing call sites during rename. */
export type ClockedUser = ScheduledUser;

export type ClockCountsWithUsers = {
	clocked_in?: number;
	clocked_out?: number;
	scheduled_users?: ScheduledUser[];
	/** @deprecated API renamed to scheduled_users */
	clocked_users?: ScheduledUser[];
};

type RowWithScheduledUsers = {
	scheduled_users?: ScheduledUser[];
	clock_counts?: ClockCountsWithUsers | null;
};

export const scheduledUsersFromRow = (
	row?: RowWithScheduledUsers | ClockCountsWithUsers | null,
): ScheduledUser[] => {
	if (!row) return [];
	const asCounts = row as ClockCountsWithUsers;
	const asRow = row as RowWithScheduledUsers;
	const users =
		asRow.scheduled_users ??
		asRow.clock_counts?.scheduled_users ??
		asRow.clock_counts?.clocked_users ??
		asCounts.scheduled_users ??
		asCounts.clocked_users;
	return Array.isArray(users) ? users.filter((u) => u != null) : [];
};

/** @deprecated Use scheduledUsersFromRow */
export const clockedUsersFromCounts = (clock?: ClockCountsWithUsers | null): ScheduledUser[] =>
	scheduledUsersFromRow(clock);

export const scheduledUserDisplayName = (user: ScheduledUser) => {
	const first = String(user.first_name || '').trim();
	const last = String(user.last_name || '').trim();
	const full = [first, last].filter(Boolean).join(' ').trim();
	return full || `User ${user.id}`;
};

/** @deprecated Use scheduledUserDisplayName */
export const clockedUserDisplayName = scheduledUserDisplayName;

const normalizeClockinKey = (status: string | null | undefined): string =>
	String(status || '')
		.trim()
		.toUpperCase()
		.replace(/\s+/g, '_');

const clockinStatusModifier = (status: string | null | undefined): 'in' | 'out' | null => {
	const key = normalizeClockinKey(status);
	if (key === 'CLOCK_IN' || key === 'CLOCKED_IN') return 'in';
	if (key === 'CLOCK_OUT' || key === 'CLOCKED_OUT') return 'out';
	return null;
};

const userPopoverLabel = (user: ScheduledUser): string => {
	const name = scheduledUserDisplayName(user);
	const key = normalizeClockinKey(user.clockin_status);
	if (!key) return name;
	return `${name} · ${formatClockinStatusLabel(user.clockin_status)}`;
};

type Props = {
	users?: ScheduledUser[];
	avatarSize?: number;
};

const DashboardClockedUsersRow = ({ users, avatarSize = 42 }: Props) => {
	const trackRef = useRef<HTMLDivElement>(null);
	const [scrollState, setScrollState] = useState({ left: false, right: false });
	const list = Array.isArray(users) ? users : [];

	const updateScrollState = useCallback(() => {
		const el = trackRef.current;
		if (!el) return;
		setScrollState({
			left: el.scrollLeft > 4,
			right: el.scrollLeft + el.clientWidth < el.scrollWidth - 4,
		});
	}, []);

	useEffect(() => {
		updateScrollState();
		const el = trackRef.current;
		if (!el) return undefined;
		el.addEventListener('scroll', updateScrollState, { passive: true });
		const observer = new ResizeObserver(updateScrollState);
		observer.observe(el);
		return () => {
			el.removeEventListener('scroll', updateScrollState);
			observer.disconnect();
		};
	}, [updateScrollState, list.length]);

	const scrollBy = (direction: -1 | 1) => {
		const el = trackRef.current;
		if (!el) return;
		el.scrollBy({ left: direction * (avatarSize + 20), behavior: 'smooth' });
	};

	if (list.length === 0) return null;

	return (
		<div
			className={classNames('hr-dashboard__clocked-users', {
				'hr-dashboard__clocked-users--scroll-left': scrollState.left,
				'hr-dashboard__clocked-users--scroll-right': scrollState.right,
			})}>
			{scrollState.left ? (
				<button
					type='button'
					className='hr-dashboard__clocked-users-nav hr-dashboard__clocked-users-nav--prev'
					aria-label='Scroll scheduled users left'
					onClick={() => scrollBy(-1)}>
					<ChevronLeftIcon fontSize='small' />
				</button>
			) : null}
			<div ref={trackRef} className='hr-dashboard__clocked-users-track'>
				{list.map((user) => {
					const statusMod = clockinStatusModifier(user.clockin_status);
					return (
						<div key={user.id} className='hr-dashboard__clocked-user'>
							<Popovers desc={userPopoverLabel(user)} trigger='hover'>
								<span
									className={classNames(
										'hr-dashboard__clocked-user-trigger',
										statusMod && `hr-dashboard__clocked-user-trigger--${statusMod}`,
									)}>
									<ImageCell fullImage={user.avatar} size={avatarSize} />
									{statusMod ? (
										<span
											className={classNames(
												'hr-dashboard__clocked-user-status',
												`hr-dashboard__clocked-user-status--${statusMod}`,
											)}
											aria-hidden
										/>
									) : null}
								</span>
							</Popovers>
						</div>
					);
				})}
			</div>
			{scrollState.right ? (
				<button
					type='button'
					className='hr-dashboard__clocked-users-nav hr-dashboard__clocked-users-nav--next'
					aria-label='Scroll scheduled users right'
					onClick={() => scrollBy(1)}>
					<ChevronRightIcon fontSize='small' />
				</button>
			) : null}
		</div>
	);
};

export default DashboardClockedUsersRow;
