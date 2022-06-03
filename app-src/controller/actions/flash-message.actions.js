import RnBgTask from 'react-native-bg-thread';

export const flashMessage = (params) => {
    return (dispatch) => {
        const bgTask = () => dispatch({ type: "SYSTEM_STATUS_SET_FLASH_PARAMS", flash: { ...params, visible: true } });
        try { RnBgTask.runInBackground(() => bgTask()) } catch (error) { bgTask() }
    };
};

export const hideSnackbar = () => {
    return (dispatch) => {
        dispatch({ type: "SYSTEM_STATUS_SET_FLASH_PARAMS", flash: { message: "", duration: 1850, visible: false } })
    }
}