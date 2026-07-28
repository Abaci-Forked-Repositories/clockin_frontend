
export const AxiosTimeout = 20000;


export const customStyles = {
    menu: (base:any) => ({
      ...base,
      
      maxHeight: "150px", // your desired height
   
    }),
    menuPortal:(base:any) => ({
      ...base,
      
     zIndex:9999, // your desired height
   
    }),
    control: (provided:any, state:any) => ({
      ...provided,
      height: 28,
      borderRadius: "15px",
      backgroundColor:"#F8F9FA" ,
      borderColor:"#EBECED",
      fontWeight: 600, 
      fontSize: "13px",
    }),
    option: (provided:any, state:any) => ({
      ...provided,
      backgroundColor: state.isFocused ? "#EFF2F7" : null,
      color: state.isFocused ? "black" : "inherit",
      // backgroundColor: state.isSelected ? "#EFF2F7" : null,
      // color: state.isSelected ? "your_selected_text_color" : "inherit",
      ":active": {
        backgroundColor: "#EFF2F7",
        // color: "your_selected_text_color",
      },
    }),
    menuList: (base:any) => ({
      ...base,
      maxHeight: "150px", // your desired height
     
    }),
  };

  export const customStylesForVisitorCount = {
    menu: (base:any) => ({
      ...base,
      
      maxHeight: "150px", // your desired height
   
    }),
    menuPortal:(base:any) => ({
      ...base,
      
     zIndex:9999, // your desired height
   
    }),
    control: (provided:any, state:any) => ({
      ...provided,
      height: 25,
      borderRadius: "15px",
      backgroundColor:"#F8F9FA" ,
      borderColor:"#EBECED",
      fontWeight: 600, 
      fontSize: "13px",
    }),
    option: (provided:any, state:any) => ({
      ...provided,
      backgroundColor: state.isFocused ? "#EFF2F7" : null,
      color: state.isFocused ? "black" : "inherit",
      // backgroundColor: state.isSelected ? "#EFF2F7" : null,
      // color: state.isSelected ? "your_selected_text_color" : "inherit",
      ":active": {
        backgroundColor: "#EFF2F7",
        // color: "your_selected_text_color",
      },
    }),
    menuList: (base:any) => ({
      ...base,
      maxHeight: "150px", // your desired height
     
    }),
  };
  export const customStyleForMultiSelectDarkMode = {
    menu: (base:any) => ({
      ...base,
      maxHeight: "140px", // your desired height
    }),
    control: (provided:any, state:any) => ({
      ...provided,
      minHeight: 28,
      borderRadius: "15px",
      backgroundColor:"#212529" ,
      borderColor:"#343A40",
      fontWeight: 600, 
      fontSize: "13px",
      color:'white',
    }),
    option: (provided:any, state:any) => ({
      ...provided,
      borderRadius:"10px",    
      backgroundColor: state.isFocused ? "#505359" : null,      
      color: 'white ' ,
      ":active": {
        backgroundColor: "#505359",
      },
     
    }),
    menuList: (base:any) => ({
      ...base,
      maxHeight: "140px", // your desired height
      backgroundColor: "black",
      paddingLeft:"5px",
      paddingRight:"5px",
      color:"white"
    }),
    multiValue: (provided:any) => ({
      ...provided,
      color:'white',
      backgroundColor:'#2E2E2E',
      borderRadius:"10px" 
  }),
    multiValueLabel: (provided:any) => ({
      ...provided,
      color:'white',
  }),

  };

  export const tableStyleOverrideConstant =  {
              MuiCheckbox: {
                colorSecondary: {
                color: "grey",
                "&$checked": {
                  color: "grey"
                },
                // "&$hover":{
                //   color: "black"
                // }
                
                },
              },
              MuiPaper:{
                root:{
                  fontFamily:'inherit'

                }
              },
              MuiPopover:{
                paper:{
                  borderRadius:'10px',
                }
              },
              MuiMenuItem:{
                root:{
                  fontFamily:'inherit'
                }
              }
              
              }

  export const selectCustomStyle = {
    menu: (base:any) => ({
      ...base,
  
      maxHeight: "140px", // your desired height
    }),
    control: (provided:any, state:any) => ({
      ...provided,
      height: 45,
      borderRadius: "15px",
      backgroundColor:"#F8F9FA" ,
      borderColor:"#EBECED",
      fontWeight: 600, 
      fontSize: "13px",
    }),
    option: (provided:any, state:any) => ({
      ...provided,
      backgroundColor: state.isFocused ? "#EFF2F7" : null,
      color: state.isFocused ? "black" : "inherit",
      // backgroundColor: state.isSelected ? "#EFF2F7" : null,
      // color: state.isSelected ? "your_selected_text_color" : "inherit",
      ":active": {
        backgroundColor: "#EFF2F7",
        // color: "your_selected_text_color",
      },
    }),
    menuList: (base:any) => ({
      ...base,
      maxHeight: "140px", // your desired height
    }),
  };
  
  export const customStyleForMultiSelect = {
    menu: (base:any) => ({
      ...base,
  
      maxHeight: "140px", // your desired height
    }),
    control: (provided:any, state:any) => ({
      ...provided,
      minHeight: 28,
      borderRadius: "15px",
      backgroundColor:"#F8F9FA" ,
      borderColor:"#EBECED",
      fontWeight: 600, 
      fontSize: "13px",
    }),
    option: (provided:any, state:any) => ({
      ...provided,
      backgroundColor: state.isFocused ? "#EFF2F7" : null,
      color: state.isFocused ? "black" : "inherit",
      ":active": {
        backgroundColor: "#EFF2F7",
        // color: "your_selected_text_color",
      },
    }),
    menuList: (base:any) => ({
      ...base,
      maxHeight: "140px", // your desired height
    }),
    multiValue: (provided:any) => ({
      ...provided,
      color:'gray',
      backgroundColor:'#dcdcdc ',
      borderRadius:"10px" 
  }),
   
  };

  export const customStylesMultiselect = {
    menu: (base:any) => ({
      ...base,
  
      maxHeight: "140px", // your desired height
    }),
    control: (provided:any, state:any) => ({
      ...provided,
      minHeight: 28,
      borderRadius: "15px",
      backgroundColor:"#F8F9FA" ,
      borderColor:"#EBECED",
      fontWeight: 600, 
      fontSize: "13px",
    }),
    option: (provided:any, state:any) => ({
      ...provided,
      backgroundColor: state.isFocused ? "#EFF2F7" : null,
      color: state.isFocused ? "black" : "inherit",
      // backgroundColor: state.isSelected ? "#EFF2F7" : null,
      // color: state.isSelected ? "your_selected_text_color" : "inherit",
      ":active": {
        backgroundColor: "#EFF2F7",
        // color: "your_selected_text_color",
      },
    }),
    menuList: (base:any) => ({
      ...base,
      maxHeight: "140px", // your desired height
    }),
  };

  export const YesOrNoOptions = [
    { value: "Yes", label: "Yes" },
    { value: "No", label: "No" },
  ];
  export const YesOrNoFieldOptions = [
    { value: "Yes", label: "Yes" },
    { value: "No", label: "No" },
  ];

  export const buttonColor=["#d33","#46BCAA","#0082C2","#4D69FA","#BC922E","#152B52"]



  export const daysOfWeek = ["S", "M", "T", "W", "T", "F", "S"];
  export const daysOfWeekText =['Sun','Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];



  
	export const FieldOptions = [
		{ value: 'Text', label: 'Text' },
		{ value: 'Large Text', label: 'Large Text' },
		{ value: 'Number', label: 'Number' },
		{ value: 'Email', label: 'Email' },
		{ value: 'Document', label: 'Document' },
		{ value: 'Photo', label: 'Photo' },
		{ value: 'Single Option', label: 'Single Option' },
		{ value: 'Multiple Options', label: 'Multiple Options' },
		{ value: 'Yes or no question', label: 'Yes or no question' },
		{ value: 'Date', label: 'Date' },
		{ value: 'URL', label: 'URL' },
		{ value: 'Phone', label: 'Phone' },
	];

  export const navItems = [
    { title: 'Tower', key: 'towers' },
    { title: 'Company', key: 'company' },
    // { title: 'Group', key: 'Group' },
    { title: 'Event', key: 'Event' },
    { title: 'Visitor', key: 'Visitor' },
    { title: 'Account', key: 'Account' },

  ];

  export const navItemsForMessage = [
    { title: 'Display Messages', key: 'Display Messages',url:'/settings/messages/dispaymessages' },
    // { title: 'Event-Driven Messages', key: 'Event-Driven Messages',url:'/settings/messages/eventdrivenmessages' },
    { title: 'Message Templates', key: 'Message Templates',url:'/settings/messages/messagetemplates' },
    

  ];

  export const DataFiledOptions = {
    towers: 'towers',
    Group: 'groups',
    company: 'company',
    Event: 'events',
    Visitor: 'visitor',
    Account: 'account',
  };





  export const TriggerOptions = [
		{ value: 'Scheduled', label: 'Scheduled' },
		{ value: 'Requested', label: 'Requested' },
		{ value: 'Exited', label: 'Exited' },
		{ value: 'Approved', label: 'Approved' },
		{ value: 'Rejected', label: 'Rejected' },
	];
  	// { value: 'Signing In', label: 'Signing In' },
		// { value: 'Signing Out', label: 'Signing Out' },
		// { value: 'Pre-registered', label: 'Pre-registered' },
		// { value: 'Rejected Signing In', label: 'Rejected Signing In' },
    // { value: 'Delayed', label: 'Delayed' },
    // { value: 'Issued', label: 'Issued ' },
    // { value: 'No Show', label: 'No Show' },


  export const MessageChannelOptions = [
		{ value: 'Email', label: 'Email' },
		{ value: 'Sms', label: 'Sms' },
		
		
	];

  export const EntryTypes = [
		{ value: 'Entry', label: 'Entry' },
		{ value: 'Exit', label: 'Exit' },
    { value: 'No-Action', label: 'No-Action' },

		
		
	];


  export 	const errorMessage = {
		Tenant: '*Messages have already been assigned to groups, or please enable group visibility.',
		Site: '*Messages have already been assigned to groups, or please enable group visibility.',
	};

  export const BufferTimeOptions=[
                                  {label: "15 Minutes", value:900},
                                  {label: "30 Minutes", value: 1800},
                                  {label: "1 Hour", value: 3600},
                                  {label: "2 Hour", value:7200},
                                ] 



   

// export const userNamesBasedOnUserTypes = {
//   zaair_admin	:'Admin',
//   zaair_assistant: ''
// }

export const namesBasedOnUserTypes:any={
	'zaair_admin':'Admin',
	'tenant_admin':'Company Admin',
	'abaci_admin':'Admin',
	'zaair_assistant':'Assistant',
	'zaair_receptionist':'Receptionist',
  "tenant_employee" : 'Company Employee',
	'tenant_user':'Company User'
}

export const getDefaultFields = () => [
  {
    id: 1,
    description: 'First name',
    type_of_field: 'Text',
    is_required: true,
    order: 0,
    options: [],
  },
  {
    id: 2,
    description: 'Last name',
    type_of_field: 'Text',
    is_required: false,
    order: 0,
    options: [],
  },
  
  {
    id: 4,
    description: 'Email',
    type_of_field: 'Email',
    is_required: true,
    order: 0,
    options: [],
  },
  {
    id: 5,
    description: 'Contact No',
    type_of_field: 'Phone',
    is_required: true,
    order: 0,
    options: [],
  },
];


export const customStylesDark = {
  menu: (base:any) => ({
    ...base,
    
    maxHeight: "150px", // your desired height
 
  }),
  menuPortal:(base:any) => ({
    ...base,
    
   zIndex:9999, // your desired height
 
  }),
  control: (provided:any, state:any) => ({
    ...provided,
    height: 28,
    borderRadius: "15px",
    backgroundColor:"#212529" ,
    borderColor:"#343A40",
    fontWeight: 600, 
    fontSize: "13px",
    color:'red',
    
   
 
    
    
  }

),

  option: (provided:any, state:any) => ({
    ...provided,
    borderRadius:"10px",
    
    backgroundColor: state.isFocused ? "#505359" : null,
    
    color: 'white ' ,
    // backgroundColor: state.isSelected ? "#EFF2F7" : null,
    // color: state.isSelected ? "your_selected_text_color" : "inherit",
    ":active": {
      backgroundColor: "#505359",
      // color: "your_selected_text_color",
    },
    
  }),
  singleValue: (provided:any) => ({
    ...provided,
    color: 'white', // Ensure selected value text is red
}),
  menuList: (base:any) => ({
    ...base,
    maxHeight: "150px", // your desired height
    backgroundColor: "black",
    paddingLeft:"5px",
    paddingRight:"5px",
    color:"white"


   
  }),
};



export const SeverityColorCodes:any = {
  Low:'#46BCAA',
  Medium:'#FFD600',
  High:'#d33',

};

export const statusColorCodes:any = {
  Active:'#46BCAA',
  Inactive:'#F35421',
  Invited:'#4D69FA',
  Unknown:'#82C200',
  Disabled:'#F35421',
  Deleted:'#d33',
  Activated:'#46BCAA',
  Deactivated:'#F35421',
  APPROVED:'#46BCAA',
  REJECTED:'#F35421',
  CANCELLED:'#F35421',
  PENDING:'#FFD600',
  APPLIED:'#FFD600',
  PARTIAL:'#D97706',
  INVITED:'#4D69FA',
 


};


export const csvLimit = 100000;
export const pdfLimit = 5000;
export const statusForFrontend= { Activated: 'Active', Deactivated: 'Inactive', Invited: 'Invited' };

export const validationlist = [
  'Please make sure to fill in all the required fields.',
  'Date field: Input a date in the format YYYY-MM-DD.',
  'Time field: Input a time in 24 hour format  hh:mm:ss.',
  'Numeric field: Provide a numeric value.',
  'Email field: Enter a valid email address.',
  'Single Select: Enter an option from the dropdown list.',
  'Multi Select: Enter options with comma separator from the dropdown list.',
  'File fields are not supported.',
];


export const relationTypeChoices = [
  { label: 'Permanent', value: 'Permanent' },
  { label: 'Contract', value: 'Contract' },
  { label: 'Internship', value: 'Internship' },
  { label: 'Training', value: 'Training' },
  { label: 'Daily', value: 'Daily' },
  { label: 'Consultant', value: 'Consultant' },
  { label: 'Guest', value: 'Guest' },
  { label: 'Service', value: 'Service' },
  { label: 'Other', value: 'Other' }
];
export const statusTypeChoices = [
  { label: 'Active', value: 'Active' },
  { label: 'Inactive', value: 'Inactive' },
  { label: 'Blocked', value: 'Blocked' },
  
];


export const Category = [
    { label: 'VIP', value: 'VIP' },
    { label: 'Staff', value: 'Staff' },
    { label: 'Guest', value: 'Guest' },
    { label: 'Maintanance', value: 'Maintanance' },
    { label: 'Authority', value: 'Authority' },
    { label: 'Warning', value: 'Warning' },
    { label: 'BlackList', value: 'BlackList' }
];


export const GenderOptions = [
    { label: 'Male', value: 'Male' },
    { label: 'Female', value: 'Female' },
    { label: 'Other', value: 'Other' },
    { label: 'Does not want to disclose', value: 'Does not want to disclose' },
];

export const userTypesToCapital= {
  "super_admin": "Super Admin",
  "admin": "Admin",
  "admin_assistant": "Admin Assistant",
  "user": "User",
  "security": "Security",
}
export const lastActivity = {"ForceExit":"OrangeUpArrowIcon",
  "Exit":"GreenArrowIcon",
  "ForceEntry":"OrangeDownArrowIcon",
  "Unknown":"UnKnownActivity",
  "Entry":"RedArrowIcon",

}