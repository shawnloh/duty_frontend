import {
  ADD_STATUS,
  ADD_STATUS_FAILURE,
  ADD_STATUS_SUCCESS,
  DELETE_STATUS,
  DELETE_STATUS_FAILURE,
  DELETE_STATUS_SUCCESS,
  ADD_BLOCKOUT,
  ADD_BLOCKOUT_FAILURE,
  ADD_BLOCKOUT_SUCCESS,
  DELETE_BLOCKOUT,
  DELETE_BLOCKOUT_FAILURE,
  DELETE_BLOCKOUT_SUCCESS,
  CLEAR_ERRORS,
  EDIT_PERSONNEL_POINT,
  EDIT_PERSONNEL_POINT_FAILURE,
  EDIT_PERSONNEL_POINT_SUCCESS
} from './constants';

export const addStatus = (personnelId, statusId, startDate, endDate) => ({
  type: ADD_STATUS,
  payload: {
    personnelId,
    statusId,
    startDate,
    endDate
  }
});

export const addStatusSuccess = ({ personnelId, status }) => ({
  type: ADD_STATUS_SUCCESS,
  payload: {
    personnelId,
    status
  }
});

export const addStatusFailure = errors => ({
  type: ADD_STATUS_FAILURE,
  payload: errors
});

export const deleteStatus = (personnelId, pStatusId) => ({
  type: DELETE_STATUS,
  payload: {
    personnelId,
    pStatusId
  }
});

export const deleteStatusSuccess = ({ personnelId, statusId }) => ({
  type: DELETE_STATUS_SUCCESS,
  payload: {
    personnelId,
    statusId
  }
});

export const deleteStatusFailure = errors => ({
  type: DELETE_STATUS_FAILURE,
  payload: errors
});

export const addBlockout = (personnelId, date) => ({
  type: ADD_BLOCKOUT,
  payload: {
    personnelId,
    date
  }
});

export const addBlockoutSuccess = (personnelId, blockoutDates) => ({
  type: ADD_BLOCKOUT_SUCCESS,
  payload: {
    personnelId,
    blockoutDates
  }
});

export const addBlockoutFailure = errors => ({
  type: ADD_BLOCKOUT_FAILURE,
  payload: errors
});

export const deleteBlockout = (personnelId, date) => ({
  type: DELETE_BLOCKOUT,
  payload: {
    personnelId,
    date
  }
});

export const deleteBlockoutSuccess = (personnelId, blockoutDates) => ({
  type: DELETE_BLOCKOUT_SUCCESS,
  payload: {
    personnelId,
    blockoutDates
  }
});

export const deleteBlockoutFailure = errors => ({
  type: DELETE_BLOCKOUT_FAILURE,
  payload: errors
});

export const clearErrors = () => ({
  type: CLEAR_ERRORS
});

export const editPersonnelPoint = (personnelId, personnelPointId, point) => ({
  type: EDIT_PERSONNEL_POINT,
  payload: {
    personnelId,
    personnelPointId,
    point
  }
});

export const editPersonnelPointSuccess = (
  personnelId,
  personnelPointId,
  points
) => ({
  type: EDIT_PERSONNEL_POINT_SUCCESS,
  payload: {
    personnelId,
    personnelPointId,
    points
  }
});

export const editPersonnelPointFailure = errors => ({
  type: EDIT_PERSONNEL_POINT_FAILURE,
  payload: errors
});
