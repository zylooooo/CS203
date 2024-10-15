import PropTypes from "prop-types";

const Step4 = ({ register, errors }) => (
  <div className="flex flex-col justify-center items-center">
    <h2 className="text-xl font-extrabold">Account Created!</h2>
    <p>
      Welcome to RallyRank! Ready to serve up some fun? Create your first tournament today!
    </p>
  </div>
);

// is this supposed to be here?
Step4.propTypes = {
  register: PropTypes.func.isRequired,
  errors: PropTypes.shape({
    password: PropTypes.object,
    confirmPassword: PropTypes.object,
  }).isRequired,
};

export default Step4;
