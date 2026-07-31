import React, { MutableRefObject } from 'react';
import Swal from 'sweetalert2'; // Adjust the import according to your setup
import classNames from 'classnames';
import Button from '../../bootstrap/Button'; // Adjust the import according to your setup
import { authAxios } from '../../../axiosInstance';
import { buttonColor } from '../../../helpers/constants';
import { extractApiErrorMessage } from '../../../hooks/useErrorHandler';
import { leaveRequestActionUrl } from '../../../pages/LeaveManagement/LeaveRequest/leaveRequestUtils';


interface AcceptAndRejectButtonProps {
    id: Number;
  tableRef: MutableRefObject<any>;
  url:string;
//   text:string;
//   confirmBtnText:string;
//   payload:any;
//   OnSuccess: (response: any) => void; 
//   Icon:string
//   Buttoncolor:string
//   ButtonText:string
//   CancelButton:string
}

const AcceptAndRejectButton: React.FC<AcceptAndRejectButtonProps> = ({id,tableRef,url}:any) => {

  const onclickHandler = (type) => {

    Swal.fire({
        title: 'Are you sure?',
      icon: 'info',
      text: "You won't be able to revert this!",
      showCancelButton: true,
      iconColor: buttonColor[4],
      confirmButtonColor: buttonColor[type==='Accept'?5:4],
      cancelButtonColor: buttonColor[0],
      confirmButtonText:"Submit" ,
      cancelButtonText: "Cancel",
        input: "text",
        inputAttributes: {
          autocapitalize: "off",
        },

        showLoaderOnConfirm: true,
        preConfirm: async (value) => {
          try {
            const trimmed = value?.trim?.() ?? '';
            const isLeaveRequest = String(url || '').includes('leave-requests');
            if (isLeaveRequest) {
              const action = type === 'Accept' ? 'approve' : 'reject';
              const response = await authAxios.post(
                leaveRequestActionUrl(id, action),
                trimmed ? { response_text: trimmed } : {},
              );
              tableRef?.current?.onQueryChange?.();
              return response.data;
            }
            const githubUrl = `${url}/${id}`;
            const response = await authAxios.patch(githubUrl,{response_text:value,status:`${type.toUpperCase()}ED`});
            tableRef?.current?.onQueryChange?.();
            return response.data;
          } catch (error) {
            const apiMessage = extractApiErrorMessage(error);
            Swal.showValidationMessage(
              apiMessage ? `Request failed: ${apiMessage}` : `Request failed: ${error.message}`,
            );
          }
        },
        
        });
  };

  return (
    <>
     <Button
      isOutline={false}
      isLight
      size='sm'
      color='secondary'
      className={classNames('text-nowrap', {
        'border-light': false,
      })}
      icon='Done'
      onClick={()=>onclickHandler('Accept')}>
     Accept
    </Button>
    
    <Button
      isOutline={false}
      color='warning'
      isLight
      size='sm'
      className={classNames('text-nowrap', {
        'border-light': false,
      })}
      icon='Close'
      onClick={()=>onclickHandler('Reject')}>
     Reject
    </Button>
    </>

  );
};

export default AcceptAndRejectButton;
