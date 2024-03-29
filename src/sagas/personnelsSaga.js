import {
  all,
  takeLatest,
  select,
  take,
  race,
  put,
  takeEvery,
  call
} from 'redux-saga/effects';
import { fromJS } from 'immutable';

import {
  loadPersonnelsFailure,
  loadPersonnelsSuccess,
  personnelsUpdateEventPoints,
  personnelsUpdatePlatoon,
  personnelsUpdatePointsSystem,
  personnelsUpdateRank,
  personnelsUpdateStatus
} from '../actions/personnelsActions';

import {
  UPDATE_RANK,
  UPDATE_RANK_SUCCESS,
  UPDATE_RANK_FAILURE
} from '../pages/ranks/constants';
import {
  UPDATE_PLATOON,
  UPDATE_PLATOON_FAILURE,
  UPDATE_PLATOON_SUCCESS
} from '../pages/platoons/constants';

import {
  UPDATE_EVENT,
  UPDATE_EVENT_SUCCESS,
  UPDATE_EVENT_FAILURE,
  CREATE_EVENT_SUCCESS,
  DELETE_EVENT,
  DELETE_EVENT_FAILURE,
  DELETE_EVENT_SUCCESS
} from '../pages/events/constants';

import {
  ADD_POINT_SUCCESS,
  DELETE_POINT,
  DELETE_POINT_SUCCESS,
  DELETE_POINT_FAILURE,
  UPDATE_POINT_SUCCESS
} from '../pages/points/constants';

import {
  UPDATE_STATUS,
  UPDATE_STATUS_FAILURE,
  UPDATE_STATUS_SUCCESS
} from '../pages/statuses/constants';

import PersonnelsService from '../services/personnels';

function* refreshPersonnelsFromServer() {
  try {
    const response = yield call(PersonnelsService.getPersonnels);
    if (response.ok) {
      const personnels = {};
      const ids = [];

      response.data.forEach(person => {
        const { _id: id } = person;
        personnels[id] = person;
        ids.push(id);
      });
      yield put(loadPersonnelsSuccess({ ids, personnels }));
    } else {
      yield put(
        loadPersonnelsFailure(response.data.message || response.data.errors)
      );
    }
  } catch (error) {
    yield put(loadPersonnelsFailure([error.message]));
  }
}
function* updatePersonnelsPointSystemName() {
  const points = yield select(state => state.points.get('points'));

  const ids = yield select(state => state.personnels.get('ids'));
  let personnels = yield select(state => state.personnels.get('personnels'));

  ids.forEach(id => {
    const person = personnels.get(id);
    const newPoints = person.get('points').map(point => {
      let currPoint = point;
      currPoint = currPoint.set(
        'pointSystem',
        points.get(currPoint.getIn(['pointSystem', '_id']))
      );
      return currPoint;
    });
    personnels = personnels.setIn([id, 'points'], newPoints);
  });
  yield put(personnelsUpdatePointsSystem(personnels));
}

function* deletePersonnelsPointsSystem(action) {
  const eventIdToDelete = action.payload;
  const { success } = yield race({
    success: take(DELETE_POINT_SUCCESS),
    failure: take(DELETE_POINT_FAILURE)
  });
  if (success) {
    const personnelsState = yield select(state => state.personnels);
    const ids = personnelsState.get('ids');
    let personnels = personnelsState.get('personnels');
    ids.forEach(id => {
      const person = personnels.get(id);
      const newPoints = person.get('points').filter(point => {
        return point.getIn(['pointSystem', '_id']) !== eventIdToDelete;
      });
      personnels = personnels.setIn([id, 'points'], newPoints);
    });

    yield put(personnelsUpdatePointsSystem(personnels));
  }
}

function* revertPersonnelPoints(event) {
  let personnels = yield select(state => state.personnels.get('personnels'));
  const personnelIds = event.get('personnels').map(person => person.get('_id'));

  personnelIds.forEach(id => {
    const person = personnels.get(id);
    const newPoints = person.get('points').map(point => {
      let currPoint = point;
      if (
        point.getIn(['pointSystem', '_id']) ===
        event.getIn(['pointSystem', '_id'])
      ) {
        currPoint = currPoint.set(
          'points',
          currPoint.get('points') - event.get('pointsAllocation')
        );
        return currPoint;
      }
      return currPoint;
    });
    const newEventsDate = person
      .get('blockOutDates')
      .indexOf(event.get('date') >= 0)
      ? person
          .get('eventsDate')
          .delete(person.get('eventsDate').indexOf(event.get('date')))
      : null;

    personnels = personnels.setIn([id, 'points'], newPoints);

    if (newEventsDate) {
      personnels = personnels.setIn([id, 'eventsDate'], newEventsDate);
    }
  });
  return personnels;
}

function* addPersonnelPoints(event) {
  let personnels = yield select(state => state.personnels.get('personnels'));
  const personnelIds = event.get('personnels').map(person => person.get('_id'));

  personnelIds.forEach(pId => {
    const person = personnels.get(pId);
    const newPoints = person.get('points').map(point => {
      let currPoint = point;
      if (
        point.getIn(['pointSystem', '_id']) ===
        event.getIn(['pointSystem', '_id'])
      ) {
        currPoint = currPoint.set(
          'points',
          currPoint.get('points') + event.get('pointsAllocation')
        );
        return currPoint;
      }
      return currPoint;
    });

    const newEventsDate = person
      .get('eventsDate')
      .indexOf(event.get('date') < 0)
      ? person.get('eventsDate').push(event.get('date'))
      : null;

    personnels = personnels.setIn([pId, 'points'], newPoints);

    if (newEventsDate) {
      personnels = personnels.setIn([pId, 'eventsDate'], newEventsDate);
    }
  });
  return personnels;
}

function* deleteEventUpdatePoints(action) {
  const { revert, eventId } = action.payload;
  if (revert) {
    const event = yield select(state =>
      state.events.get('events').get(eventId)
    );
    const { success } = yield race({
      success: take(DELETE_EVENT_SUCCESS),
      failure: take(DELETE_EVENT_FAILURE)
    });
    if (success) {
      const personnels = yield call(revertPersonnelPoints, event);
      yield put(personnelsUpdateEventPoints(personnels));
    }
  }
}

function* createEventUpdatePoints(action) {
  const { _id: id } = action.payload;
  const event = yield select(state => state.events.get('events').get(id));
  const personnels = yield call(addPersonnelPoints, event);
  yield put(personnelsUpdateEventPoints(personnels));
}

function* updateEventUpdatePoints(action) {
  const { eventId } = action.payload;
  const oldEvent = yield select(state =>
    state.events.get('events').get(eventId)
  );
  const { successAction } = yield race({
    successAction: take(UPDATE_EVENT_SUCCESS),
    failure: take(UPDATE_EVENT_FAILURE)
  });
  if (successAction) {
    let personnels = yield call(revertPersonnelPoints, oldEvent);
    yield put(personnelsUpdateEventPoints(personnels));
    const newEvent = fromJS(successAction.payload);
    personnels = yield call(addPersonnelPoints, newEvent);
    yield put(personnelsUpdateEventPoints(personnels));
  }
}

function* updatePersonnelsPlatoonName(action) {
  const { id, name } = action.payload;
  const { success } = yield race({
    success: take(UPDATE_PLATOON_SUCCESS),
    failure: take(UPDATE_PLATOON_FAILURE)
  });
  if (success) {
    const personnelsState = yield select(state => state.personnels);
    const ids = personnelsState.get('ids');
    let personnels = personnelsState.get('personnels');
    ids.forEach(personId => {
      let person = personnels.get(personId);
      if (person.getIn(['platoon', '_id']) === id) {
        person = person.setIn(['platoon', 'name'], String(name).toUpperCase());
      }
      personnels = personnels.set(personId, person);
    });
    yield put(personnelsUpdatePlatoon(personnels));
  }
}

function* updatePersonnelsRankName(action) {
  const { id, name } = action.payload;
  const { success } = yield race({
    success: take(UPDATE_RANK_SUCCESS),
    failure: take(UPDATE_RANK_FAILURE)
  });

  if (success) {
    const personnelsState = yield select(state => state.personnels);
    const ids = personnelsState.get('ids');
    let personnels = personnelsState.get('personnels');
    ids.forEach(personId => {
      let person = personnels.get(personId);
      if (person.getIn(['rank', '_id']) === id) {
        person = person.setIn(['rank', 'name'], String(name).toUpperCase());
      }
      personnels = personnels.set(personId, person);
    });
    yield put(personnelsUpdateRank(personnels));
  }
}

function* updateStatusesName(action) {
  const { id, name } = action.payload;
  const { success } = yield race({
    success: take(UPDATE_STATUS_SUCCESS),
    failure: take(UPDATE_STATUS_FAILURE)
  });

  if (success) {
    const personnelsState = yield select(state => state.personnels);
    const ids = personnelsState.get('ids');
    let personnels = personnelsState.get('personnels');
    ids.forEach(personId => {
      const person = personnels.get(personId);
      const newStatuses = person.get('statuses').map(status => {
        let currStatus = status;
        if (status.getIn(['statusId', '_id']) === id) {
          currStatus = currStatus.setIn(
            ['statusId', 'name'],
            String(name).toUpperCase()
          );
        }
        return currStatus;
      });
      personnels = personnels.setIn([personId, 'statuses'], newStatuses);
    });
    yield put(personnelsUpdateStatus(personnels));
  }
}

function* personnelsSagaWatcher() {
  yield all([
    takeEvery(UPDATE_POINT_SUCCESS, updatePersonnelsPointSystemName),
    takeLatest(ADD_POINT_SUCCESS, refreshPersonnelsFromServer),
    takeEvery(DELETE_POINT, deletePersonnelsPointsSystem),
    takeEvery(UPDATE_PLATOON, updatePersonnelsPlatoonName),
    takeEvery(UPDATE_RANK, updatePersonnelsRankName),
    takeEvery(UPDATE_STATUS, updateStatusesName),
    takeEvery(DELETE_EVENT, deleteEventUpdatePoints),
    // takeLatest(CREATE_EVENT_SUCCESS, refreshPersonnelsFromServer)
    takeEvery(CREATE_EVENT_SUCCESS, createEventUpdatePoints),
    takeEvery(UPDATE_EVENT, updateEventUpdatePoints)
  ]);
}

export default personnelsSagaWatcher;
