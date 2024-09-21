import PropTypes from "prop-types";

const Step5 = ({ register, errors }) => (
  <div>
    <h2 className="text-xl font-extrabold">Availability</h2>
    <p>Let us know when you are available to play</p>
    <div className="flex flex-col gap-5 mt-8">
      <div className="flex flex-col gap-2"></div>
      <p>You can edit your availability later</p>
    </div>
  </div>
);

Step5.propTypes = {
  register: PropTypes.func.isRequired,
  errors: PropTypes.shape({}).isRequired,
};

export default Step5;
