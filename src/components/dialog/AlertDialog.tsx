import React from 'react';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import Fade from '@material-ui/core/Fade';

type TProps = {
    isOpen: boolean;
    title: string;
    message: string;
    onClose: (event:React.MouseEvent) => void
}

class AlertDialog extends React.Component<TProps> {
    render() {
        const { isOpen, title, message, onClose } = this.props;

        return (
            <Dialog
                open={isOpen}
                TransitionComponent={Fade}
                keepMounted
                disableBackdropClick
                disableEscapeKeyDown
            >
                <DialogTitle>
                    {title}
                </DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        {message}
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={onClose}
                        variant="contained"
                        color="primary" autoFocus>
                        OK
                    </Button>
                </DialogActions>
            </Dialog>
        );
    }
}

export default AlertDialog;
