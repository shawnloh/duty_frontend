import { takeLatest, call, select, put, all } from 'redux-saga/effects';
import { ADD_RANK, DELETE_RANK, UPDATE_RANK } from './constants';
import {
  addRankSuccess,
  addRankFailure,
  deleteRankSuccess,
  deleteRankFailure,
  updateRankSuccess,
  updateRankFailure
} from './actions';
import { logout } from '../../actions/authActions';
import RanksService from '../../services/ranks';

function* addRank(action) {
  try {
    const name = action.payload;
    const ids = yield select(state => state.ranks.get('ids'));
    const ranks = yield select(state => state.ranks.get('ranks'));
    const response = yield call(RanksService.createRank, name);

    if (response.ok) {
      const newRank = response.data;
      ids.push(newRank._id);
      ranks[newRank._id] = {
        _id: newRank._id,
        name: newRank.name
      };
      yield put(addRankSuccess({ ids, ranks }));
    } else if (response.status === 401) {
      yield put(logout());
    } else {
      let errors = [];
      if (response.data.message) {
        errors.push(response.data.message);
      }

      if (response.data.errors) {
        errors = errors.concat(response.data.errors);
      }
      yield put(addRankFailure(errors));
    }
  } catch (error) {
    yield put(addRankFailure([error.message]));
  }
}

function* deleteRank(action) {
  try {
    const deleteId = action.payload;
    const response = yield call(RanksService.deleteRank, deleteId);
    if (response.ok) {
      let ids = yield select(state => state.ranks.get('ids'));
      const { ...ranks } = yield select(state => state.ranks.get('ranks'));
      ids = ids.filter(id => id !== deleteId);
      delete ranks[deleteId];
      yield put(deleteRankSuccess({ ids, ranks }));
    } else if (response.status === 401) {
      yield put(logout());
    } else {
      let errors = [];
      if (response.data.message) {
        errors.push(response.data.message);
      }

      if (response.data.errors) {
        errors = errors.concat(response.data.errors);
      }
      yield put(deleteRankFailure(errors));
    }
  } catch (error) {
    yield put(deleteRankFailure([error.message]));
  }
}

function* updateRank(action) {
  try {
    const { id, name } = action.payload;
    const response = yield call(RanksService.updateRank, id, name);
    if (response.ok) {
      const { ...ranks } = yield select(state => state.ranks.get('ranks'));
      ranks[id] = {
        _id: response.data._id,
        name: response.data.name
      };

      yield put(updateRankSuccess(ranks));
    } else if (response.status === 401) {
      yield put(logout());
    } else if (response.status === 304) {
      yield put(
        updateRankFailure(['Updating rank must not be the same as before'])
      );
    } else {
      let errors = [];
      if (response.data.message) {
        errors.push(response.data.message);
      }

      if (response.data.errors) {
        errors = errors.concat(response.data.errors);
      }
      yield put(updateRankFailure(errors));
    }
  } catch (error) {
    yield put(updateRankFailure([error.message]));
  }
}

function* ranksWatcher() {
  yield all([
    takeLatest(ADD_RANK, addRank),
    takeLatest(DELETE_RANK, deleteRank),
    takeLatest(UPDATE_RANK, updateRank)
  ]);
}

export default ranksWatcher;