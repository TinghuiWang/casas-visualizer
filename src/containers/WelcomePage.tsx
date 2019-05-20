import React from 'react';
import { 
    withStyles, Theme, createStyles, WithStyles 
} from '@material-ui/core/styles';
import Electron from 'electron';
import { TDatasetHistory } from '../reducers/appConfig';
import Typography from '@material-ui/core/Typography';
import Paper from '@material-ui/core/Paper';
import Button from '@material-ui/core/Button';
import ImportIcon from '@material-ui/icons/SaveAlt';
import OpenIcon from '@material-ui/icons/FolderOpen';
import ThemeIcon from '@material-ui/icons/Style';
import { IRootReducer, ConnectedReduxProps } from '../reducers';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import { connect } from 'react-redux';
import ImportDatasetDialog from '../components/dialog/ImportDatasetDialog';
import { TDatasetType, importDatasetFromDirectory } from '../utils/dataset';
import dataset from '../reducers/dataset';
import { appOpenDatasetAsync, appRemoveDataset } from '../actions/appConfig';
import { ListItemIcon, ListItemSecondaryAction, IconButton } from '@material-ui/core';
import RemoveCircleIcon from '@material-ui/icons/RemoveCircleOutline';
import { openDatasetAsync } from '../actions/dataset';

const styles = (theme: Theme) => createStyles({
  layout: {
    width: 'auto',
    display: 'block', // Fix IE 11 issue.
    marginLeft: theme.spacing.unit * 3,
    marginRight: theme.spacing.unit * 3,
    [theme.breakpoints.up(800 + theme.spacing.unit * 3 * 2)]: {
      width: 800,
      marginLeft: 'auto',
      marginRight: 'auto',
    },
  },
  paper: {
    marginTop: theme.spacing.unit * 3,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: `${theme.spacing.unit * 2}px ${theme.spacing.unit * 3}px ${theme.spacing.unit * 3}px`,
  },
  title: {
    textAlign: "center",
    marginTop: theme.spacing.unit * 8,
    marginLeft: theme.spacing.unit * 3,
    marginRight: theme.spacing.unit * 3,
    [theme.breakpoints.up(800 + theme.spacing.unit * 3 * 2)]: {
      width: 800,
      marginLeft: 'auto',
      marginRight: 'auto',
    },
  },
  list: {
    width: '100%'
  },
  buttonGroup: {
    marginLeft: 'auto',
    marginRight: 'auto',
    width: 'fit-content'
  },
  button: {
    margin: theme.spacing.unit
  },
  buttonIcon: {
    marginRight: theme.spacing.unit
  }
});

interface IStyleProps extends WithStyles<typeof styles> {}

type TReadOnlyProps = {
  showErrorDialog: (title:string, message:string) => void;
  showProgressDialog: (
    message:string, determinate?:boolean, value?:number, total?:number
  ) => void;
  hideProgressDialog: () => void;
  showChangeThemeDialog: () => void;
  onDatasetOpen: () => void
};

type TPropsFromState = {
  history: Array<TDatasetHistory>;
}

type TProps = Readonly<TReadOnlyProps> & IStyleProps & TPropsFromState & 
  ConnectedReduxProps<any>;

type TState = {
  isImportDialogOpen:boolean;
}

class WelcomePage extends React.Component<TProps, TState> {
  state : TState = {
    isImportDialogOpen: false
  }

  componentDidMount() {
  }

  handleDatasetSelect = (datasetInfo:TDatasetHistory) =>
    (event:React.MouseEvent) => {
      const {
        showErrorDialog, showProgressDialog, hideProgressDialog, 
        dispatch, onDatasetOpen
      } = this.props;
      dispatch(openDatasetAsync(
        datasetInfo.path, (err) => {
          hideProgressDialog();
          if(err) {
            showErrorDialog(
              "Error Occurred when Loading Dataset",
              err.message + "\r\n" + err
            );
          } else {
            onDatasetOpen();
          }
        }, showProgressDialog
      ));
    }

  handleImportDatasetClick = (event:React.MouseEvent) => {
    this.setState({
      isImportDialogOpen: true
    })
  }

  handleImportDatasetDialogClose = () => {
    this.setState({
      isImportDialogOpen: false
    })
  }

  handleImportDatasetSubmit = (
    type:TDatasetType, directoryPath:string, sitePath:string, outputPath:string
  ) => {
    const { 
      showErrorDialog, showProgressDialog, hideProgressDialog
    } = this.props;
    this.handleImportDatasetDialogClose();
    if(type === "annotationFile") {
      
    }
    importDatasetFromDirectory(
      type, directoryPath, sitePath, outputPath,
      (err) => {
        hideProgressDialog();
        if(err) {
          showErrorDialog(
            "Error Occurred when Importing Dataset",
            err.message + '\r\n' + err
          );
        }
        // TODO: Dispatch open dataset from directory
      },
      showProgressDialog
    );
  }

  handleDatasetOpenClick = (event:React.MouseEvent) => {
    const {
      showErrorDialog, showProgressDialog, hideProgressDialog, 
      dispatch, onDatasetOpen
    } = this.props;
    const folders = Electron.remote.dialog.showOpenDialog({
      title: "Select Dataset Directory",
      defaultPath: Electron.remote.app.getPath("documents"),
      properties: ['createDirectory', 'openDirectory']
    });
    if(folders && folders.length == 1) {
      dispatch(appOpenDatasetAsync(
        folders[0], (err) => {
          hideProgressDialog();
          if(err) {
            showErrorDialog(
              "Error open dataset from directory",
              err.message + "\r\n" + err
            );
          }
        }, showProgressDialog
      ));
    }
  }

  handleDatasetRemoveClick = (index:number) => (event:React.MouseEvent) => {
    const {dispatch} = this.props;
    console.log("Remove dataset " + index);
    dispatch(appRemoveDataset(index));
  }

  handleThemeSelectClick = (event:React.MouseEvent) => {
    const {showChangeThemeDialog} = this.props;
    showChangeThemeDialog();
  }

  render() {
    const { classes, history } = this.props

    return (
      <main className={classes.layout}>
        <Typography className={classes.title}
          component="h2"
          variant="h2">
          CASAS Smart Home Visualizer
        </Typography>
        <div className={classes.buttonGroup}>
            <Button className={classes.button}
              variant="contained"
              color="primary"
              onClick={this.handleImportDatasetClick}>
              <ImportIcon className={classes.buttonIcon} />
              Import Dataset
            </Button>
            <Button className={classes.button}
              variant="contained"
              color="primary"
              onClick={this.handleDatasetOpenClick}>
              <OpenIcon className={classes.buttonIcon} />
              Open Dataset
            </Button>
            <Button className={classes.button}
              variant="contained"
              color="primary"
              onClick={this.handleThemeSelectClick}>
              <ThemeIcon className={classes.buttonIcon} />
              Select Theme
            </Button>
        </div>
        <Paper className={classes.paper} elevation={1}>
          <List className={classes.list}> {
            history.map((datasetInfo, index) => (
              <ListItem key={index} button
                onClick={
                  this.handleDatasetSelect(datasetInfo)
                }>
                <ListItemText 
                  primary={datasetInfo.name}
                  secondary={datasetInfo.path} />
                <ListItemSecondaryAction>
                  <IconButton aria-label="Remove"
                    onClick={
                      this.handleDatasetRemoveClick(index)
                    }>
                    <RemoveCircleIcon></RemoveCircleIcon>
                  </IconButton>
                </ListItemSecondaryAction>
              </ListItem>
            ))
          } </List>
        </Paper>
        <ImportDatasetDialog
          isOpen={this.state.isImportDialogOpen}
          onClose={this.handleImportDatasetDialogClose}
          onSubmit={this.handleImportDatasetSubmit}
        ></ImportDatasetDialog>
      </main>
    );
  }
}

const mapStateToProps = (state:IRootReducer) => {
  return {
      history: state.appConfig.history
  };
}

export default connect(mapStateToProps)(
  withStyles(styles)(WelcomePage)
);
