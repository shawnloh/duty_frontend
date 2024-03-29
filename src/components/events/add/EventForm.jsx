import React, { useCallback, memo } from 'react';
import {
  Form,
  Row,
  Col,
  FormGroup,
  Label,
  Input,
  FormText,
  Button,
  FormFeedback
} from 'reactstrap';
import PropTypes from 'prop-types';
import moment from 'moment-timezone';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { List } from 'immutable';
import Select from 'react-select';
import makeAnimated from 'react-select/animated';
import GenerateForm from './GenerateForm';
import useSelectPersonnelsOptionsByDate from '../../../pages/events/hooks/useSelectPersonnelsOptionsByDate';
import useHandleSetPersonnels from '../../../pages/events/hooks/useHandleSetPersonnels';

const animatedComponents = makeAnimated();

const EventFormSchema = Yup.object().shape({
  name: Yup.string()
    .min(1)
    .max(50)
    .required('Name is required'),
  date: Yup.string()
    .required('Date is required')
    .test('checkValidDate', 'Invalid date, only DDMMYY is allowed', date => {
      return moment(date, 'DDMMYY', true).isValid();
    }),
  pointSystem: Yup.string().required('Point System is required'),
  pointAllocation: Yup.number()
    .min(1, 'Minimum of 1 point is needed')
    .required('Point Allocation is required'),
  selectedPersonnels: Yup.array()
    .min(1, 'At least 1 personnels is required')
    .required('Personnel is required')
});

const EventForm = ({
  points,
  platoons,
  ranks,
  statuses,
  personnels,
  isAdding,
  handleSubmit,
  handleLogout
}) => {
  const formik = useFormik({
    initialValues: {
      name: '',
      date: '',
      pointSystem: points.has(0) ? points.getIn(['0', '_id']) : '',
      pointAllocation: 1,
      selectedPersonnels: []
    },
    validationSchema: EventFormSchema,
    onSubmit: handleSubmit
  });

  /**
   * Use by generation form
   */
  const setPersonnelsByGenerate = useCallback(
    personnelsToSet => {
      formik.setFieldValue('selectedPersonnels', personnelsToSet);
    },
    [formik]
  );

  const selectPersonnelsOptions = useSelectPersonnelsOptionsByDate(
    formik.values.date,
    personnels
  );

  const handleChangePersonnels = useHandleSetPersonnels(
    formik.values.date,
    formik.setFieldValue,
    'selectedPersonnels'
  );

  return (
    <Form onSubmit={formik.handleSubmit}>
      <Row>
        <Col>
          <FormGroup>
            <Label for="Name">Name</Label>
            <Input
              type="text"
              name="name"
              id="Name"
              placeholder="Name of the event"
              onChange={formik.handleChange}
              value={formik.values.name}
              disabled={formik.isSubmitting}
              invalid={
                formik.touched.name &&
                formik.errors.name &&
                formik.errors.name !== ''
              }
            />
            {formik.touched.name && formik.errors.name ? (
              <FormFeedback>{formik.errors.name}</FormFeedback>
            ) : null}
          </FormGroup>
          <FormGroup>
            <Label for="PointSystem">Point System</Label>
            <Input
              type="select"
              name="pointSystem"
              id="PointSystem"
              value={formik.values.pointSystem}
              disabled={formik.isSubmitting}
              onChange={formik.handleChange}
              invalid={
                formik.touched.pointSystem &&
                formik.errors.pointSystem &&
                formik.errors.pointSystem !== ''
              }
            >
              {points.map(point => (
                <option key={point.get('_id')} value={point.get('_id')}>
                  {point.get('name')}
                </option>
              ))}
            </Input>
            {formik.touched.pointSystem && formik.errors.pointSystem ? (
              <FormFeedback>{formik.errors.pointSystem}</FormFeedback>
            ) : null}
          </FormGroup>
          <FormGroup>
            <Label for="Date">Date</Label>
            <Input
              type="text"
              name="date"
              id="Date"
              disabled={formik.isSubmitting}
              placeholder={`e.g. ${moment()
                .tz('Asia/Singapore')
                .format('DDMMYY')}`}
              onChange={formik.handleChange}
              value={formik.values.date}
              invalid={
                formik.touched.date &&
                formik.errors.date &&
                formik.errors.date !== ''
              }
            />
            {formik.touched.date && formik.errors.date ? (
              <FormFeedback>{formik.errors.date}</FormFeedback>
            ) : null}
            <FormText color="muted">
              Must be in DDMMYY format, it will automatically convert to
              DD-MM-YYYY during submission
            </FormText>
          </FormGroup>
          <FormGroup>
            <Label for="PointAllocation">Point Allocation</Label>
            <Input
              type="number"
              name="pointAllocation"
              disabled={formik.isSubmitting}
              id="PointAllocation"
              onChange={formik.handleChange}
              value={formik.values.pointAllocation}
              invalid={
                formik.touched.pointAllocation &&
                formik.errors.pointAllocation &&
                formik.errors.pointAllocation !== ''
              }
            />
            <FormText color="muted">
              Min of 1 point is required to create event
            </FormText>
            {formik.touched.pointAllocation && formik.errors.pointAllocation ? (
              <FormFeedback>{formik.errors.pointAllocation}</FormFeedback>
            ) : null}
          </FormGroup>
        </Col>
      </Row>
      <Row>
        <Col />
      </Row>
      {formik.touched.selectedPersonnels && formik.errors.selectedPersonnels ? (
        <Row>
          <Col>
            <p className="text-danger">{formik.errors.selectedPersonnels}</p>
          </Col>
        </Row>
      ) : null}

      <Row>
        <Col className="w-100">
          <FormGroup>
            <Label for="selectedPersonnels">
              Personnels Selected: [{formik.values.selectedPersonnels.length}]
            </Label>
            <Select
              options={selectPersonnelsOptions}
              components={animatedComponents}
              isMulti
              id="selectedPersonnels"
              name="selectedPersonnels"
              placeholder="Select Personnels.."
              // value={getSelectedPersonnelsValues}
              value={formik.values.selectedPersonnels}
              onChange={handleChangePersonnels}
            />
          </FormGroup>
        </Col>
      </Row>
      <Row className="mt-2">
        <Col>
          <GenerateForm
            platoons={platoons}
            ranks={ranks}
            statuses={statuses}
            setSelectedPersonnels={setPersonnelsByGenerate}
            pointSystem={formik.values.pointSystem}
            date={formik.values.date}
            handleLogout={handleLogout}
          />
        </Col>
      </Row>
      <Row className="my-2">
        <Col className="text-center">
          <Button
            size="lg"
            className="w-100"
            color="success"
            type="submit"
            disabled={formik.isSubmitting || isAdding}
          >
            {formik.isSubmitting || isAdding ? `Creating...` : `Create Event`}
          </Button>
        </Col>
      </Row>
    </Form>
  );
};

EventForm.propTypes = {
  points: PropTypes.oneOfType([PropTypes.instanceOf(List)]).isRequired,
  ranks: PropTypes.oneOfType([PropTypes.instanceOf(List)]).isRequired,
  platoons: PropTypes.oneOfType([PropTypes.instanceOf(List)]).isRequired,
  statuses: PropTypes.oneOfType([PropTypes.instanceOf(List)]).isRequired,
  personnels: PropTypes.oneOfType([PropTypes.instanceOf(List)]).isRequired,
  // personnels: PropTypes.arrayOf(PropTypes.instanceOf(Map)).isRequired,
  isAdding: PropTypes.bool.isRequired,
  handleSubmit: PropTypes.func.isRequired,
  handleLogout: PropTypes.func.isRequired
};

export default memo(EventForm);
