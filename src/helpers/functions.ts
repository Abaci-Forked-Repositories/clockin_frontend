import moment from "moment";
import { daysOfWeekText } from "./constants";
import { authAxios } from "../axiosInstance";
import { baseURL } from "./baseURL";

export const handleDaysText=(WeekArray:any)=>{
  /* eslint-disable prefer-destructuring */
  if(WeekArray){
    const firstIndex = daysOfWeekText.indexOf(WeekArray[0]);
    const isContinuous = WeekArray.every((day:any, i:any) => daysOfWeekText[firstIndex + i] === day);
    let label = "";
    switch (WeekArray.length) {
      case 7:
      label = "Every day";
      break;
      case 1:
      label = WeekArray[0];
      break;
      case 0:
        label ='----'
        break;
      default:
      label = isContinuous
        ? `${WeekArray[0]} to ${WeekArray[WeekArray.length - 1]}`
        : WeekArray.join(", ");
    }
    return label
  }
  return '----'
  
  /* eslint-enable prefer-destructuring */
}





export const reactSelectValueGenerator = (data: any ,fieldName:any ) => {
  if (typeof data === 'string') {
    return { value:data, label: data };
  }

  if(fieldName=== ''){
  return { value:data, label: data };
}

  if (typeof data === 'object') {
    return { ...data,value:data.id, label: data[fieldName] };
  }

  return '';
};







export const getTimeZone = () => {
    const tempArray:any = [];
  //@ts-ignore
    const aryIanaTimeZones = Intl.supportedValuesOf("timeZone");
  
    aryIanaTimeZones.forEach((timeZone) => {
      tempArray.push(timeZone);
    });
  
    return tempArray;
  };

  export const getInputType = (dataType:string) => {
    switch (dataType) {
      case "Number":
        return "number";
      case "Photo":
      case "Document":
        return "file";
      case "URL":
        return "url";
      case "Phone":
        return "tel";
      case "Date":
        return "date";
      case "Email":
        return "email";
      default:
        return "text";
    }
  };
  export const fieldsHandler = (rowData: any, data: any) => {
    if (data.type_of_field === 'Multiple Options') {
        return rowData[data.description]?.length > 0
            ? rowData[data.description].map((obj: any) => obj.label).join(', ')
            : '----';
    } 
    
    if (data.type_of_field === 'Single Option') {
        return rowData[data.description] ? rowData[data.description].value : '----';
    }
    
    if (rowData[data.description]) {
        return rowData[data.description] || '----';
    }
    
    return '----';
};



  export const MessageOptions = [
		{ value: 'General', label: 'General' },
		// { value: 'Site', label: 'Site' },
		// { value: 'Tenant', label: 'Tenant' },
    { value: 'Tower', label: 'Tower' },
		{ value: 'Company', label: 'Company' },
	];

  export const truncateString = (str:string)  => {
    if (str.length <= 40) {
      return str;
    }
    return `${str.slice(0, 40)}...`;
  };

  export const formatFiltersOld = (filters:any) => {
    let otherFilters = ""; // Initialize the string that will hold the query parameters

    filters.filter((item:any) => {
        // Check if the value is an array and if it is not empty
        return !(Array.isArray(item.value) && item.value.length === 0);
    }).forEach((filtered_item:any) => { // Changed .map to .forEach since we're not transforming the array items
        let fieldName:string;

        if (filtered_item.column.type === "date") {
            // For date fields, prepend with 'datefilterrange_' and format the date value
            fieldName = `datefilterrange_${filtered_item.column.field}`;
            otherFilters += `&${fieldName}=${moment(filtered_item.value).format('YYYY-MM-DD')}to${moment(filtered_item.value).format('YYYY-MM-DD')}`;
        } else {
            // For non-date fields, check if there's a lookup to determine if 'search_' should be prepended
            fieldName = filtered_item.column.lookup ? filtered_item.column.field : `search_${filtered_item.column.field}`;

            if (Array.isArray(filtered_item.value) && filtered_item.column.lookup) {
                // filtered_item.value.forEach((val:any) => {
                  // const formattedArray = JSON.stringify(filtered_item.value)
                  // console.log(formattedArray)

                  let arrayString = JSON.stringify(filtered_item.value);
                  // Replace double quotes with single quotes
                  arrayString = arrayString.replace(/"/g, "'");
                  // Encode the square brackets
                  arrayString = arrayString.replace(/\[/g, '%5B').replace(/\]/g, '%5D');

                    otherFilters += `&multipleoptions_${fieldName}=array${arrayString}`;
                // });
            } else {
                otherFilters += `&${fieldName}=${filtered_item.value}`;
            }
        }
    });

    return otherFilters; // Return the formatted query string
}

export const formatFilters = (filters:any) => {
  const tempArray=['employee_details__is_in_bus','is_running','access']
  /** Exact YYYY-MM-DD match — no datefilterrange_ or __icontains (e.g. license dates). */
  const exactDateFields = ['start_date', 'expiry_date'];
  let otherFilters = ""; // Initialize the string that will hold the query parameters
  filters.filter((item:any) => {
      // Check if the value is an array and if it is not empty
      return !(Array.isArray(item.value) && item.value.length === 0);
  }).forEach((filtered_item:any) => { // Changed .map to .forEach since we're not transforming the array items
      let fieldName:string;

      if (exactDateFields.includes(filtered_item.column.field)) {
          const dateValue = moment(filtered_item.value).isValid()
              ? moment(filtered_item.value).format('YYYY-MM-DD')
              : String(filtered_item.value || '').trim();
          if (dateValue) {
              otherFilters += `&${filtered_item.column.field}=${dateValue}`;
          }
          return;
      }

      if (filtered_item.column.type === "date") {
          // For date fields, prepend with 'datefilterrange_' and format the date value
          fieldName = `datefilterrange_${filtered_item.column.field}`;
          otherFilters += `&${fieldName}=${moment(filtered_item.value).format('YYYY-MM-DD')}to${moment(filtered_item.value).format('YYYY-MM-DD')}`;
      } else {
          // For non-date fields, check if there's a lookup to determine if 'search_' should be prepended
          // eslint-disable-next-line no-nested-ternary
          fieldName = `${filtered_item.column.field}__icontains`;

          if (Array.isArray(filtered_item.value) && filtered_item.column.lookup) {
            if(tempArray.includes(filtered_item.column.field)&&filtered_item.value.length===1){
                    otherFilters += `&${filtered_item.column.field}=${filtered_item.value[0]}`;
                 }else  if(tempArray.includes(filtered_item.column.field)&&filtered_item.value.length>=2){
                  // For multiple values, use comma-separated
                  otherFilters += `&${filtered_item.column.field}__in=${filtered_item.value.join(',')}`;
               } else if (!tempArray.includes(filtered_item.column.field)) {
                  // Handle lookup fields not in tempArray
                  if (filtered_item.value.length === 1) {
                    otherFilters += `&${filtered_item.column.field}=${filtered_item.value[0]}`;
                  } else if (filtered_item.value.length >= 2) {
                    // For multiple values, use comma-separated with __in filter
                    otherFilters += `&${filtered_item.column.field}__in=${filtered_item.value.join(',')}`;
                  }
               }
            }  

          else if(!filtered_item.column.lookup) {
              otherFilters += `&${fieldName}=${filtered_item.value}`;
          }
      }
  });

  return otherFilters; // Return the formatted query string
}





export const formatFiltersWithOptions = (filters:any) => {
  let otherFilters = ""; // Initialize the string that will hold the query parameters
  filters.filter((item:any) => {
      // Check if the value is an array and if it is not empty
      return !(Array.isArray(item.value) && item.value.length === 0);
  }).forEach((filtered_item:any) => { // Changed .map to .forEach since we're not transforming the array items


      if(filtered_item.column.lookup){
          
        otherFilters += `&${filtered_item.column.field}=${filtered_item.value}`;

      }else if(!filtered_item.column.lookup) {
              otherFilters += `&${filtered_item.column.field}__icontains=${filtered_item.value}`;
          }
  });

  return otherFilters; // Return the formatted query string
}







export const debounce = (func: any, wait: number | undefined) => {
  let timeout: string | number | NodeJS.Timeout | undefined;

  return function executedFunction(...args: any[]) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };

    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};




export const formatBytes = (bytes: number) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024; // or 1000 for decimal
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`; // eslint-disable-line prefer-exponentiation-operator
};


  

  export const updateHiddenColumnsInLocalStorage = (
    column: any,
    hidden: any,
    hiddenColumnsKey: string
  ) => {
    // Retrieve and parse the hiddenColumns array from localStorage, default to an empty array if null
    let hiddenColumns: any[] =
      JSON.parse(localStorage.getItem(hiddenColumnsKey) || '[]');
    if (hidden) {
      // Add to hiddenColumns if not already present
      if (!hiddenColumns.includes(column.field)) {
        // console.log(column.field)

        hiddenColumns.push(column.field);
      }
    } else {
      // Remove from hiddenColumns if present
      hiddenColumns = hiddenColumns.filter((field: any) => field !== column.field);
    }


  
    // Update localStorage
    localStorage.setItem(hiddenColumnsKey, JSON.stringify(hiddenColumns));
  };
  



  export const nameCreaterFromList=(list:any,name:string)=>{
    const Limit = 3;
    const Name =
        list && list.length !== 0
            ? list.map((data:any) => data[name])
            : [];

    if (Name.length > Limit) {
        const displayedSites = Name.slice(0, Limit).join(', ');
        const remainingCount = Name.length - Limit;
        const remainingText = ` (+${remainingCount} more)`;
        return `${displayedSites}${remainingText}`; // Concatenating strings, no Fragment needed
    }
    return Name.length > 0 ? Name.join(', ') : '----';

  }


export const formatTimestamp=(timestamp:string)=> {
  if (!timestamp) return '';  // Handle cases where timestamp is undefined or null
  
  // Split the timestamp and extract the date and time up to the minute
  const splitTimestamp = timestamp.split(':');
  const result = `${splitTimestamp[0]}:${splitTimestamp[1]}`;
  
  // Format the result using moment.js
  return moment(result).format('YYYY-MM-DD : hh:mm A');
}

export const formatTimeFromTimestamp = (timestamp: string) => {
  if (!timestamp) return '----';
  const parsed = moment(timestamp);
  if (!parsed.isValid()) return '----';
  return parsed.format('HH:mm');
}

  

export const isBase64 = (str: any): boolean => {
  // console.log("Input:", str);

  // Check if the input is a string
  if (typeof str !== 'string') {
    return false;
  }

if(str.includes('data:')){
  return true;

}
  return false;
};




export const getColorCodes = (numColors: number) => {
  const palette = <any>[];
  const baseColors = [ "#263745" ,"#0082CA","#77A1C3", ]; // Base colors in hex

  const adjustColorDistinctly = (hex: string, adjustmentIndex: number): string => {
    // Convert hex to RGB
    const rgb = {
      r: parseInt(hex.slice(1, 3), 16),
      g: parseInt(hex.slice(3, 5), 16),
      b: parseInt(hex.slice(5, 7), 16),
    };

    // Modify the color distinctively by changing its RGB values cyclically
    const adjustments = [50, -30, 70]; // Example cyclic adjustments for R, G, B
    const adjustedRGB = {
      r: Math.min(255, Math.max(0, rgb.r + adjustments[adjustmentIndex % 3])),
      g: Math.min(255, Math.max(0, rgb.g + adjustments[(adjustmentIndex + 1) % 3])),
      b: Math.min(255, Math.max(0, rgb.b + adjustments[(adjustmentIndex + 2) % 3])),
    };

    // Convert back to hex
    return `#${adjustedRGB.r.toString(16).padStart(2, "0")}${adjustedRGB.g
      .toString(16)
      .padStart(2, "0")}${adjustedRGB.b.toString(16).padStart(2, "0")}`;
  };

  for (let i = 0; i < numColors; i += 1) {
    const baseColor = baseColors[i % baseColors.length];
    const adjustedColor =
      i < baseColors.length
        ? baseColor
        : adjustColorDistinctly(baseColors[i % baseColors.length], Math.floor(i / baseColors.length));
    palette.push(adjustedColor);
  }

  return palette;
};





export const  calculatePercentage=(data:any, numeratorKey:any, denominatorKey:any,isChart=false)=> {
  const numerator = data[numeratorKey] || 0;
  const denominator = data[denominatorKey] || 0;

  if (numerator !== 0 && denominator !== 0) {
    const percentage = (numerator / denominator) * 100;

    if (isChart) {
      return Number.isInteger(percentage) ? percentage : percentage.toFixed(1);
    }

    return Number.isInteger(percentage)
      ? `${percentage}%`
      : `${percentage.toFixed(1)}%`;
  }

  return "0%";
}



export const rfidCardNumber = (number: any) => {
  if (number.length === 10) {
    return number.substring(2);
  }
  if (number.length === 9) {
    return number.substring(1);
  }
  return number;
};


export const selectOptionMaker = (data: any, value: any) => {
  if (typeof data === 'object' && data !== null) {
    return {label:data,value:value};
  }

  if (typeof data === 'string' && data !== null) {
    return {label:data,value:value};
  }

  return ''; 
}

export const formatText=(text:any)=> {
  if(!text)return '';
  return text
  .split('_') // Split by underscore
  .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1)) // Capitalize first letter
  .join(' '); // Join back with space
}

export const timeZoneSlice=(dateStr:any)=> {
  if (!dateStr) return '';
  return dateStr.split("T")[0]; 
}


export const imageUrlHandler=(url:any)=> {
  const imageUrl = baseURL+`/media/${url}`; // Get the last part of the URL
  authAxios
        .get(imageUrl)
        .then((res) => {

         return res.data;
        })
        .catch((err) => {
         
        });
}


/** Resolves account/user id from a table row (nested `user`, `user_id`, or account list row). */
export const resolveTableRowUserId = (rowData: any): number | string | null => {
	if (!rowData || typeof rowData !== 'object') return null;

	const user = rowData.user;
	if (user != null) {
		if (typeof user === 'object' && !Array.isArray(user)) {
			const id = user.id ?? user.pk ?? user.user_id;
			if (id != null && id !== '') return id;
		}
		if (typeof user === 'number' || typeof user === 'string') {
			const trimmed = String(user).trim();
			if (trimmed !== '') return trimmed;
		}
	}

	if (rowData.user_id != null && rowData.user_id !== '') {
		return rowData.user_id;
	}

	if (
		rowData.id != null &&
		(rowData.first_name != null ||
			rowData.email != null ||
			rowData.employee_code != null ||
			rowData.preferred_name != null)
	) {
		return rowData.id;
	}

	return null;
};

export const userDetailsPath = (userId: number | string) => `/user-details/${userId}`;

/** Avatar from list/detail account payloads (full URL or media path). */
export const resolveUserAvatarSource = (user: any): string | null => {
	if (!user) return null;
	const raw = user?.avatar_url ?? user?.avatar ?? user?.user_data?.user_image ?? null;
	if (raw == null || raw === '') return null;
	return String(raw);
};

/** Strips host and `/media/` prefix so useImageHandler can fetch with auth. */
export const normalizeMediaPath = (image: unknown): string | null => {
	if (image == null || image === '') return null;
	const s = String(image).trim();
	if (/^https?:\/\//i.test(s)) {
		const mediaMarker = '/media/';
		const idx = s.indexOf(mediaMarker);
		if (idx === -1) return null;
		return s.slice(idx + mediaMarker.length);
	}
	return s.replace(/^\//, '');
};

export const isBase64Image = (img) => {
  return typeof img === 'string' && img.startsWith('data:image/') && img.includes(';base64,');
  };