export const allRoutesObject = {
	dashboard: {
		id: 'dashboard',
		path: '/',
	},

	UserManagement: {
		id: 'CompanyUsers',
		path: '/users',
	},
	site:{
		id: 'site',
		path: '/sites',
	
	},
	SpecialPeriod: {
		id: 'SpecialPeriod',
		path: '/special-period',
	},
	UserGroups: {
		id: 'UserGroups',
		path: '/groups',
	},
	Schedule: {
		id: 'Schedule',
		path: '/schedule',
	},
	Shift: {
		id: 'Shift',
		path: '/shift',
	},
	Doors: {
		id: 'Doors',
		path: '/doors',
	},
	// RoleManagement: {
	// 	id: 'RoleManagement',
	// 	path: '/roles',
	// },
	Registrations: {
		id: 'Registrations',
		path: '/registrations',
	},
	Customers: {
		id: 'Customers',
		path: '/customers',
	},
	Partners: {
		id: 'Partners',
		path: '/partners',
	},
	Licenses: {
		id: 'Licenses',
		path: '/licenses',
	},
	LeaveRequests: {
		id: 'LeaveRequests',
		path: '/leave-requests',
	},
	AssetRequests: {
		id: 'AssetRequests',
		path: '/asset-requests',
	},
	Assets: {
		id: 'Assets',
		path: '/assets',
	},
	BookAsset: {
		id: 'BookAsset',
		path: '/book-asset',
	},
	AssetTypes: {
		id: 'AssetTypes',
		path: '/asset-types',
	},
	WfhRequests: {
		id: 'WfhRequests',
		path: '/wfh-requests',
	},
	LeaveTypes: {
		id: 'LeaveTypes',
		path: '/leave-types',
	},
	CompOffCredits: {
		id: 'CompOffCredits',
		path: '/comp-off-credits',
	},
	/** @deprecated Use LeaveRequests.path — kept for redirects */
	LeaveManagement: {
		id: 'LeaveManagement',
		path: '/leave-management',
	},
	Attendance: {
		id: 'Attendance',
		path: '/attendance',
	},
	Settings: {
		id: 'Settings',
	 	path: 'settings',
    	subMenu: {
			GeneralSettings: {
				id: 'GeneralSettings',
				path: 'settings/general-settings',
			
		},
		Buildings: {
			id: 'Buildings',
			path: 'settings/buildings',
		},
		Gates: {
			id: 'Gates',
			path: 'settings/gates',
		},
		Controller: {
			id: 'Controller',
			path: 'settings/controller',
			

		},
		EditLog: {
			id: 'EditLog',
			path: 'settings/editlog',
		
	}
	
	}},
	UserSchedule: {
		id: 'UserSchedule',
		text: 'Schedule',
		path: '/user/schedule',
		icon: 'PendingActions',
	},
	EventLog: {
		id: 'EventLog',
		path: '/event-log',
		icon: 'Description',
	},
	settings: {
		id: 'settings',
		path: 'settings',
		icon: 'Settings',
	},

}






export const CompanyAdminRoutes = {
	dashboard: {
		id: 'dashboard',
		text: 'Dashboard',
		path: '/',
		icon: 'Dashboard',
		subMenu: null,
	},
	organization: {
		id: 'Organization',
		text: 'Organization',
		path: 'organization',
		icon: 'Business',
		subMenu: {
			site: {
				id: 'site',
				text: 'Site',
				icon: 'Apartment',
				path: '/sites',
			},
			userManagment: {
				id: 'CompanyUsers',
				text: 'Users',
				path: '/users',
				icon: 'Person',
			},
			UserGroups: {
				id: 'UserGroups',
				text: 'Groups',
				path: '/groups',
				icon: 'Group',
			},
		},
	},
	accessControl: {
		id: 'AccessControl',
		text: 'Access Control',
		path: 'access-control',
		icon: 'Lock',
		subMenu: {
			Doors: {
				id: 'Doors',
				text: 'Doors',
				path: '/doors',
				icon: 'DoorFront',
			},
		},
	},
	scheduling: {
		id: 'Scheduling',
		text: 'Scheduling',
		path: 'scheduling',
		icon: 'PendingActions',
		subMenu: {
			Schedule: {
				id: 'Schedule',
				text: 'Schedule',
				path: '/schedule',
				icon: 'PendingActions',
			},
			Shift: {
				id: 'Shift',
				text: 'Shift',
				path: '/shift',
				icon: 'AccessTime',
			},
			SpecialPeriod: {
				id: 'SpecialPeriod',
				text: 'Special Period',
				path: '/special-period',
				icon: 'Event',
			},
		},
	},
	leaveAndCompOff: {
		id: 'LeaveAndCompOff',
		text: 'Leave & Comp Off',
		path: 'leave-and-comp-off',
		icon: 'EventNote',
		subMenu: {
			LeaveRequests: {
				id: 'LeaveRequests',
				text: 'Leave Requests',
				path: '/leave-requests',
				icon: 'Event',
			},
			LeaveTypes: {
				id: 'LeaveTypes',
				text: 'Leave Types',
				path: '/leave-types',
				icon: 'EventNote',
			},
			CompOffCredits: {
				id: 'CompOffCredits',
				text: 'Comp Off Credits',
				path: '/comp-off-credits',
				icon: 'MoreTime',
			},
		},
	},
	assets: {
		id: 'AssetsGroup',
		text: 'Assets',
		path: 'assets-group',
		icon: 'Inventory',
		subMenu: {
			Assets: {
				id: 'Assets',
				text: 'Assets',
				path: '/assets',
				icon: 'DevicesOther',
			},
			AssetTypes: {
				id: 'AssetTypes',
				text: 'Asset Types',
				path: '/asset-types',
				icon: 'Category',
			},
			AssetRequests: {
				id: 'AssetRequests',
				text: 'Asset Requests',
				path: '/asset-requests',
				icon: 'Inventory',
			},
		},
	},
	remoteWork: {
		id: 'RemoteWork',
		text: 'Remote Work',
		path: 'remote-work',
		icon: 'HomeWork',
		subMenu: {
			WfhRequests: {
				id: 'WfhRequests',
				text: 'WFH Requests',
				path: '/wfh-requests',
				icon: 'HomeWork',
			},
		},
	},
	attendanceGroup: {
		id: 'AttendanceGroup',
		text: 'Attendance',
		path: 'attendance-group',
		icon: 'FactCheck',
		subMenu: {
			Attendance: {
				id: 'Attendance',
				text: 'Attendance',
				path: '/attendance',
				icon: 'Event',
			},
			EventLog: {
				id: 'EventLog',
				text: 'Event Log',
				path: '/event-log',
				icon: 'Description',
			},
		},
	},
	Settings: {
		id: 'Settings',
		text: 'Settings',
		path: 'settings',
		icon: 'Settings',
	},
};

/** Manager menu — same as company admin minus HR/Admin-only sections. */
export const ManagerRoutes = {
	dashboard: CompanyAdminRoutes.dashboard,
	organization: CompanyAdminRoutes.organization,
	scheduling: CompanyAdminRoutes.scheduling,
	leaveAndCompOff: {
		id: 'LeaveAndCompOff',
		text: 'Leave & Comp Off',
		path: 'leave-and-comp-off',
		icon: 'EventNote',
		subMenu: {
			LeaveRequests: CompanyAdminRoutes.leaveAndCompOff.subMenu.LeaveRequests,
		},
	},
	assets: {
		id: 'AssetsGroup',
		text: 'Assets',
		path: 'assets-group',
		icon: 'Inventory',
		subMenu: {
			Assets: CompanyAdminRoutes.assets.subMenu.Assets,
			AssetRequests: CompanyAdminRoutes.assets.subMenu.AssetRequests,
		},
	},
	remoteWork: CompanyAdminRoutes.remoteWork,
	attendanceGroup: CompanyAdminRoutes.attendanceGroup,
};

export const UserRoutes = {
	LeaveRequests: {
		id: 'LeaveRequests',
		text: 'Leave Requests',
		path: '/leave-requests',
		icon: 'Event',
	},
	BookAsset: {
		id: 'BookAsset',
		text: 'Asset Inventory',
		path: '/book-asset',
		icon: 'EventAvailable',
	},
	AssetRequests: {
		id: 'AssetRequests',
		text: 'Asset Requests',
		path: '/asset-requests',
		icon: 'Inventory',
	},
	WfhRequests: {
		id: 'WfhRequests',
		text: 'WFH Requests',
		path: '/wfh-requests',
		icon: 'HomeWork',
	},
	Attendance: {
		id: 'Attendance',
		text: 'Attendance',
		path: '/attendance',
		icon: 'AccessTime',
	},
	UserSchedule: {
		id: 'UserSchedule',
		text: 'Schedule',
		path: '/user/schedule',
		icon: 'PendingActions',
	},
};

export const SelfRoutes = UserRoutes;

export const PlatformAdminRoutes = {
	Registrations: {
		id: 'Registrations',
		text: 'Registrations',
		path: '/registrations',
		icon: 'AppRegistration',
	},
	Customers: {
		id: 'Customers',
		text: 'Customers',
		path: '/customers',
		icon: 'Business',
	},
	Partners: {
		id: 'Partners',
		text: 'Partners',
		path: '/partners',
		icon: 'Groups',
	},
	Licenses: {
		id: 'Licenses',
		text: 'Licenses',
		path: '/licenses',
		icon: 'CardMembership',
	},
};

export const PartnerRoutes = {
	Customers: {
		id: 'Customers',
		text: 'Customers',
		path: '/customers',
		icon: 'Business',
	},
	Licenses: {
		id: 'Licenses',
		text: 'Licenses',
		path: '/licenses',
		icon: 'CardMembership',
	},
};

export const HRRoutes = CompanyAdminRoutes;

export const roleWiseRoutes: Record<string, any> = {
	Admin: CompanyAdminRoutes,
	Manager: ManagerRoutes,
	HR: HRRoutes,
	user: UserRoutes,
	User: UserRoutes,
	platform_admin: PlatformAdminRoutes,
	partner: PartnerRoutes,
};

	






export const pagesNotInSideBar = {
	UsertDetails: {
		id: 'UserDetails',
		text: 'User Details',
		path: '/user-details/:id',
		icon: '',
	},
	ScheduleTemplateDetail: {
		id: 'ScheduleTemplateDetail',
		text: 'Schedule details',
		path: '/schedule-details/:id',
		icon: '',
	},
	SiteTemplateDetail: {
		id: 'SiteTemplateDetail',
		text: 'Site details',
		path: '/site-details/:id',
		icon: '',
	},
	GroupTemplateDetail: {
		id: 'GroupTemplateDetail',
		text: 'Group details',
		path: '/group-details/:id',
		icon: '',
	},
	AssetItemDetail: {
		id: 'AssetItemDetail',
		text: 'Asset Details',
		path: '/asset-details/:id',
		icon: '',
	},
	BookAssetDetail: {
		id: 'BookAssetDetail',
		text: 'Book Asset Details',
		path: '/book-asset/:id',
		icon: '',
	},
	CustomerDetails: {
		id: 'CustomerDetails',
		text: 'Customer Details',
		path: '/customer-details/:id',
		icon: '',
	},
	PartnerDetails: {
		id: 'PartnerDetails',
		text: 'Partner Details',
		path: '/partner-details/:id',
		icon: '',
	},

	Profile: {
		id: 'Profile',
		text: 'Profile',
		path: 'profile',
		icon: 'Login',
	},
	login: {
		id: 'login',
		text: 'Login',
		path: 'login',
		icon: 'Login',
	},
	adminLogin: {
		id: 'adminLogin',
		text: 'Admin Login',
		path: '/clockin-admin/login',
		icon: 'Login',
	},
	partnerLogin: {
		id: 'partnerLogin',
		text: 'Partner Login',
		path: '/clockin-partner/login',
		icon: 'Login',
	},
	signup: {
		id: 'signup',
		text: 'Sign Up',
		path: '/signup',
		icon: 'Login',
	},
	// Contact: {
	// 	id: 'Contact',
	// 	text: 'Contact',
	// 	path: '/contact',
	// 	icon: '',
	// },
	Register: {
		id: 'Register',
		text: 'Login',
		path: 'public/activation/:string',
		icon: 'Login',
	},
	ForgotPassword: {
		id: 'ForgotPassword',
		text: 'ForgotPassword',
		path: '/forgotpassword',
		icon: 'Login',
	},
	SetPassword: {
		id: 'SetPassword',
		text: 'Set Password',
		path: '/set-password',
		icon: 'Login',
	},


	PrivacyPolicy: {
		id: 'Privacy Policy',
		text: 'Privacy Policy',
		path: 'public/privacypolicy',
		icon: 'Login',
	},
	TermsAndConditions: {
		id: 'Terms & Conditions',
		text: 'Terms & Conditions',
		path: 'public/termsofuse',
		icon: '',
	},
	
	

}