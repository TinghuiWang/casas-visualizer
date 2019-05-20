import React from 'react';
import { 
    withStyles, Theme, WithStyles, createStyles 
} from '@material-ui/core/styles';
import CircularProgress from '@material-ui/core/CircularProgress';
import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import Fade from '@material-ui/core/Fade';
import LinearProgress from '@material-ui/core/LinearProgress';

const styles = (theme:Theme) => createStyles({
  progress: {
    margin: theme.spacing.unit * 2,
  },
  dialogContent: {
    textAlign: "center"
  }
});

interface IStyleProps extends WithStyles<typeof styles> {}

type TReadonlyProps = {
  isOpen: boolean;
  isDeterminate: boolean;
  message: string;
  total: number;
  value: number;
}

type TProps = Readonly<TReadonlyProps> & IStyleProps;

class ProgressDialog extends React.Component<TProps> {
  render() {
    const { 
      classes, isOpen, message,
      isDeterminate: isUndetermined, total, value
    } = this.props;

    return (
      <Dialog
        open={isOpen}
        TransitionComponent={Fade}
        keepMounted
        disableBackdropClick
        disableEscapeKeyDown
      >
        <DialogContent className={classes.dialogContent}>
          {
            (!isUndetermined) ? 
              <CircularProgress className={classes.progress} /> :
              <LinearProgress 
                color="primary"
                variant="determinate" 
                value={Math.min(value * 100/total, 100)} />
          }
          <DialogContentText>
            {message}
          </DialogContentText>
        </DialogContent>
      </Dialog>
    );
  }
}

export default withStyles(styles)(ProgressDialog);
