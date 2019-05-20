import React from 'react';
import { 
    withStyles, Theme, createStyles, WithStyles 
} from '@material-ui/core/styles';
import ProgressDialog from '../components/dialog/ProgressDialog';
import AlertDialog from '../components/dialog/AlertDialog';
import SelectThemeDialog from './dialog/SelectThemeDialog';
import WelcomePage from './WelcomePage';
import DatasetPage from './DatasetPage';

const styles = (theme: Theme) => createStyles({
    root: {
        display: 'flex',
    }
});

interface IStyleProps extends WithStyles<typeof styles> {}

type TReadOnlyProps = {};

type TProps = Readonly<TReadOnlyProps> & IStyleProps;

type TState = {
    state: "initial" | "welcome" | "dataset";
    isProgressDialogOpen: boolean;
    isProgressDeterminate: boolean;
    progressDialogMessage: string;
    progressValue: number;
    progressTotal: number;
    isAlertDialogOpen: boolean;
    alertDialogTitle: string;
    alertDialogMessage: string;
    isChangeThemeDialogOpen: boolean;
}

class MainPage extends React.Component<TProps, TState> {
  state : TState = {
    state: "welcome",
    isProgressDialogOpen: false,
    isProgressDeterminate: true,
    progressDialogMessage: "",
    progressValue: 0,
    progressTotal: 100,
    isAlertDialogOpen: false,
    alertDialogTitle: "",
    alertDialogMessage: "",
    isChangeThemeDialogOpen: false
  }

  componentDidMount() {
  }

  handleAlertDialogClose = (event:React.MouseEvent) => {
    this.setState({
      isAlertDialogOpen: false
    });
  }

  showError = (title:string, message:string) => {
    this.setState({
      isAlertDialogOpen: true,
      alertDialogTitle: title,
      alertDialogMessage: message
    });
  }

  showProgress = (
    message:string, determinate?:boolean, value?:number, total?:number
  ) => {
    value = value ? value : 0;
    total = total ? total : 100;
    determinate = (determinate === undefined) ? false : determinate;
    this.setState({
      isProgressDialogOpen: true,
      isProgressDeterminate: determinate,
      progressDialogMessage: message,
      progressValue: value,
      progressTotal: total
    });
  }

  hideProgress = () => {
    this.setState({
      isProgressDialogOpen: false
    });
  }

  handleDatasetClose = () => {
    this.setState({
      state: "welcome"
    });
  }

  handleChangeThemeDialogClose = () => {
    this.setState({
      isChangeThemeDialogOpen: false
    });
  }

  showChangeThemeDialog = () => {
    this.setState({
      isChangeThemeDialogOpen: true
    })
  }

  handleOpenDataset = () => {
    this.setState({
      state: "dataset"
    });
  }

  render() {
    const {classes} = this.props

    return (
      <div className={classes.root}> 
        {
          this.state.state === "welcome" && 
          <WelcomePage
            showErrorDialog={this.showError}
            showProgressDialog={this.showProgress}
            hideProgressDialog={this.hideProgress}
            showChangeThemeDialog={this.showChangeThemeDialog}
            onDatasetOpen={this.handleOpenDataset}
          ></WelcomePage>
        }
        {
          this.state.state === "dataset" &&
          <DatasetPage
            showErrorDialog={this.showError}
            showProgressDialog={this.showProgress}
            hideProgressDialog={this.hideProgress}
            showChangeThemeDialog={this.showChangeThemeDialog}
          ></DatasetPage>
        }
        <ProgressDialog
          isOpen={this.state.isProgressDialogOpen}
          isDeterminate={this.state.isProgressDeterminate}
          message={this.state.progressDialogMessage}
          value={this.state.progressValue}
          total={this.state.progressTotal}
        ></ProgressDialog>
        <AlertDialog
          isOpen={this.state.isAlertDialogOpen}
          title={this.state.alertDialogTitle}
          message={this.state.alertDialogMessage}
          onClose={this.handleAlertDialogClose}>
        </AlertDialog>
        <SelectThemeDialog
          isOpen={this.state.isChangeThemeDialogOpen}
          onClose={this.handleChangeThemeDialogClose}
        ></SelectThemeDialog>
      </div>
    );
  }
}

export default withStyles(styles)(MainPage);
