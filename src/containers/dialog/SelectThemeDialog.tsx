import React from 'react';
import { Theme, createStyles, WithStyles, withStyles } from '@material-ui/core';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import Fade from '@material-ui/core/Fade';
import FormControl from '@material-ui/core/FormControl';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import Select from '@material-ui/core/Select';
import { TAppConfig } from '../../reducers/appConfig';
import { ConnectedReduxProps, IRootReducer } from '../../reducers';
import { connect } from 'react-redux';
import { selectAppTheme } from '../../actions/appConfig';

const styles = (theme:Theme) => createStyles({
    form: {
        width: '100%', // Fix IE 11 issue.
        marginTop: theme.spacing.unit,
    },
    submit: {
        marginTop: theme.spacing.unit * 3,
    },
});

interface IStyleProps extends WithStyles<typeof styles> {}

type TReadOnlyProps = {
  onClose: () => void;
  isOpen: boolean;
}

type TPropsFromStates = {
    appConfig: TAppConfig
};

type TProps = Readonly<TReadOnlyProps> & IStyleProps & TPropsFromStates & 
  ConnectedReduxProps;

class SelectThemeDialog extends React.Component<TProps> {
  handleCancelClick = () => {
    const { onClose } = this.props;
    onClose();
  }

  handleThemeChange = (event:React.ChangeEvent<unknown>) => {
    const {dispatch} = this.props;
    let target = event.target as HTMLSelectElement;
    dispatch(selectAppTheme(target.value));
  }

  render() {
    const {
      classes, isOpen, appConfig
    } = this.props;
    return (
      <Dialog
        open={isOpen}
        TransitionComponent={Fade}
        keepMounted
        onClose={this.handleCancelClick}
      >
        <DialogTitle>
          Select Theme
        </DialogTitle>
        <DialogContent>
          <form className={classes.form}>
            <FormControl margin="normal" required fullWidth>
              <InputLabel htmlFor="theme">
                Theme
              </InputLabel>
              <Select
                onChange={this.handleThemeChange}
                value={appConfig.theme}
                inputProps={{
                  name: "theme",
                  id: "theme"
                }}>
                <MenuItem value="dark">Dark</MenuItem>
                <MenuItem value="light">Light</MenuItem>
              </Select>
            </FormControl>
          </form>
        </DialogContent>
        <DialogActions>
          <Button onClick={this.handleCancelClick}
            variant="contained"
            color="primary">
            Close
          </Button>
        </DialogActions>
      </Dialog>
    );
  }
}

const mapStateToProps = (state:IRootReducer) => {
    return {
        appConfig: state.appConfig
    };
}

export default connect(mapStateToProps)(
    withStyles(styles)(SelectThemeDialog)
);
