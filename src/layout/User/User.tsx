import React, { useState, useContext, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import classNames from 'classnames';
import { useWindowSize } from 'react-use';
import { DropdownItem, DropdownMenu } from '../../components/bootstrap/Dropdown';
import Button from '../../components/bootstrap/Button';
import useDarkMode from '../../hooks/useDarkMode';
import Collapse from '../../components/bootstrap/Collapse';
import { NavigationLine } from '../Navigation/Navigation';
import Icon from '../../components/icon/Icon';
import AuthContext from '../../contexts/authContext';
import ThemeContext from '../../contexts/themeContext';
import ProfilePic from "../../assets/img/Avatar.svg"
import useUserAvatarSrc from '../../hooks/useUserAvatarSrc';



const User = () => {

	const { width } = useWindowSize();
	const { setAsideStatus } = useContext(ThemeContext);
	const { userData, setLogOut } = useContext(AuthContext);
	const navigate = useNavigate();
	const { darkModeStatus, setDarkModeStatus } = useDarkMode();
	const [collapseStatus, setCollapseStatus] = useState<boolean>(false);
	const { t } = useTranslation(['translation', 'menu']);


	const logoutHandler = () => {
		if (width < Number(import.meta.env.VITE_API_MOBILE_BREAKPOINT_SIZE)) {
			setAsideStatus(false);
		}
		setLogOut()
			
	}
	const avatarSrc = useUserAvatarSrc(userData, ProfilePic);

	return (
		<>
			<div
				className={classNames('user', { open: collapseStatus })}
				role='presentation'
				onClick={() => setCollapseStatus(!collapseStatus)}>
				<div className='user-avatar prevent-userselect '>
					<img
						srcSet={avatarSrc}
						src={avatarSrc}
						alt=''
						width={128}
						height={128}
						onError={(event) => {
							event.currentTarget.onerror = null;
							event.currentTarget.src = ProfilePic;
							event.currentTarget.srcset = ProfilePic;
						}}
					/>

				</div>
				<div className='user-info prevent-userselect' >
					<div className='user-sub-title-email text-light' >{userData?.email}</div>
				</div>
			</div>
			<DropdownMenu >
				<DropdownItem >
					<Button
						className='prevent-userselect'
						icon='AccountBox'
						onClick={() =>
							navigate('/profile')
						}
						>
						Profile
					</Button>
				</DropdownItem>
				<DropdownItem>
					<Button
						className='prevent-userselect'
						icon={darkModeStatus ? 'DarkMode' : 'LightMode'}
						onClick={() => setDarkModeStatus(!darkModeStatus)}
						aria-label='Toggle fullscreen'>
						{darkModeStatus ? 'Dark Mode' : 'Light Mode'}
					</Button>
				</DropdownItem>
			</DropdownMenu>

			<Collapse isOpen={collapseStatus} className='user-menu'>
				<nav aria-label='aside-bottom-user-menu'>
					<div className='navigation'>
						<div
							role='presentation'
							className='navigation-item cursor-pointer'
							onClick={() => navigate('/profile')

							}>
							<span className='navigation-link navigation-link-pill'>
								<span className='navigation-link-info'>
									<Icon icon='AccountBox' className='navigation-icon' />
									<span className='navigation-text'>
										{t('menu:Profile') as ReactNode}
									</span>
								</span>
							</span>
						</div>
					</div>
				</nav>
				<NavigationLine />
				<nav aria-label='aside-bottom-user-menu-2'>
					<div className='navigation'>
						<div
							role='presentation'
							className='navigation-item cursor-pointer'
							onClick={logoutHandler}
						>
							<span className='navigation-link navigation-link-pill'>
								<span className='navigation-link-info'>
									<Icon icon='Logout' className='navigation-icon' />
									<span className='navigation-text'>
										{t('menu:Logout') as ReactNode}
									</span>
								</span>
							</span>
						</div>
					</div>
				</nav>
			</Collapse>
		</>
	);
};

export default User;
