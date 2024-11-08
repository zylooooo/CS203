// Used In: UpdateMatchTimingsCard.jsx, UpdateMatchResultsCard.jsx

const ConfirmationPopUp = ({ message, onConfirm, onCancel }) => (
    <div className = "confirmation-popup fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
        <div className = "bg-white p-8 rounded-lg shadow-lg w-1/3 text-center">
            <h2 className = "text-xl font-semibold mb-4"> Are you sure? </h2>
            <p className = "mb-6 font-semibold"> {message} </p>
            <div className = "flex justify-between">
                <button
                    onClick = {onCancel}
                    className = "px-4 py-2 bg-gray-300 rounded-lg hover:bg-gray-400 transition"
                >
                    Cancel
                </button>
                <button
                    onClick = {onConfirm}
                    className = "px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
                >
                    Confirm
                </button>
            </div>
        </div>
    </div>
);

export default ConfirmationPopUp;