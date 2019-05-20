import React from 'react';
import classNames from 'classnames';
import { 
    withStyles, Theme, createStyles, WithStyles 
} from '@material-ui/core/styles';
import EventNoteIcon from '@material-ui/icons/EventNote'
import { TDatasetHistory } from '../reducers/appConfig';
import { IRootReducer, ConnectedReduxProps } from '../reducers';
import { connect } from 'react-redux';
import { TDataState } from '../reducers/dataset';
import { AppBar, Toolbar, IconButton, Typography, Drawer, Divider, ListItem, List, ListItemIcon, ListItemText } from '@material-ui/core';
import MenuIcon from '@material-ui/icons/Menu';
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft';
import DatasetEventPage from './DatasetEventPage';
import { MaterialUiPickersDate } from 'material-ui-pickers';
import { Moment } from 'moment';
import { changeDatasetDate } from '../actions/dataset';

const drawerWidth = 240;

const styles = (theme: Theme) => createStyles({
  root: {
    display: 'flex',
  },
  appBar: {
    zIndex: theme.zIndex.drawer + 1,
    transition: theme.transitions.create(['width', 'margin'], {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.leavingScreen,
    }),
  },
  appBarShift: {
    marginLeft: drawerWidth,
    width: `calc(100% - ${drawerWidth}px)`,
    transition: theme.transitions.create(['width', 'margin'], {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.enteringScreen,
    }),
  },
  toolbar: {
    paddingRight: 24, // keep right padding when drawer closed
  },
  toolbarIcon: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    padding: '0 8px',
    ...theme.mixins.toolbar,
  },
  menuButton: {
    marginLeft: 12,
    marginRight: 36,
  },
  hidden: {
    display: 'none',
  },
  title: {
    flexGrow: 1,
  },
  drawerPaper: {
    position: 'relative',
    whiteSpace: 'nowrap',
    width: drawerWidth,
    transition: theme.transitions.create('width', {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.enteringScreen,
    }),
  },
  drawerPaperClose: {
    overflowX: 'hidden',
    transition: theme.transitions.create('width', {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.leavingScreen,
    }),
    width: theme.spacing.unit * 7,
    [theme.breakpoints.up('sm')]: {
        width: theme.spacing.unit * 9,
    },
  },
  drawerIcon: {
    marginLeft: theme.spacing.unit,
    marginRight: theme.spacing.unit
  },
  content: {
    flexGrow: 1,
    padding: theme.spacing.unit * 3,
    paddingTop: 64,
    height: '100vh',
    width: `calc(100vw - ${drawerWidth}px)`,
    overflow: 'auto',
  },
  contentClose: {
    width: `calc(100vw - ${theme.spacing.unit * 7}px)`,
    [theme.breakpoints.up('sm')]: {
      width: `calc(100vw - ${theme.spacing.unit * 9}px)`,
    }
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
};

type TPropsFromState = {
  dataset: TDataState;
}

type TProps = Readonly<TReadOnlyProps> & IStyleProps & TPropsFromState & 
  ConnectedReduxProps<any>;

type TDatasetPanels = "events" | "configuration";

type TState = {
  isDrawerOpen:boolean;
  panelSelection: TDatasetPanels
}

class DatasetPage extends React.Component<TProps, TState> {
  state : TState = {
    isDrawerOpen: false,
    panelSelection: "events"
  }

  componentDidMount() {
  }

  handleDrawerClose = (e:React.MouseEvent) => {
    this.setState({
        isDrawerOpen: false
    });
  }

  handleDrawerOpen = (e:React.MouseEvent) => {
    this.setState({
        isDrawerOpen: true
    });
  }

  handlePanelSelection = (panel:TDatasetPanels) => (e:React.MouseEvent) => {
    this.setState({
      panelSelection: panel
    });
  }

  handleDateChange = (date: MaterialUiPickersDate) => {
    const {
      dispatch, dataset, 
      hideProgressDialog, showErrorDialog, showProgressDialog
    } = this.props;
    dispatch(changeDatasetDate(date as Moment, dataset, (err) => {
      hideProgressDialog();
      if(err) {
        showErrorDialog(
          "Error on Change Date",
          "Failed to change the date to " +
          (date as Moment).toDate().toDateString() + ". " + err
        );
      }
    }, showProgressDialog));
  }

  render() {
    const { classes, dataset } = this.props

    return (
      <div className={classes.root}>
        <AppBar position="absolute"
          className={classNames(
            classes.appBar,
            this.state.isDrawerOpen && classes.appBarShift
          )}>
          <Toolbar disableGutters={!this.state.isDrawerOpen}
            className={classes.toolbar}>
            <IconButton color="inherit"
              aria-label="Open drawer"
              onClick={this.handleDrawerOpen}
              className={classNames(
                classes.menuButton,
                this.state.isDrawerOpen && classes.hidden
              )}>
              <MenuIcon/>
            </IconButton>
            <div>
              <Typography component="h1" 
                variant="h6"
                color="inherit"
                noWrap
                className={classes.title}>
                {dataset.name}
              </Typography>
            </div>
            {/* The following is going to implement menu rendering */}
            <div></div>
          </Toolbar>
        </AppBar>
        <Drawer variant="permanent"
          classes={{
            paper: classNames(
              classes.drawerPaper, 
              !this.state.isDrawerOpen && classes.drawerPaperClose)
          }}
          open={this.state.isDrawerOpen}>
          <div className={classes.toolbarIcon}>
            <IconButton onClick={this.handleDrawerClose}>
              <ChevronLeftIcon />
            </IconButton>
          </div>
          <Divider />
          <List>
            <ListItem button
              selected={
                this.state.panelSelection === "events"
              }
              onClick={this.handlePanelSelection("events")}>
              <ListItemIcon className={classes.drawerIcon}>
                <EventNoteIcon></EventNoteIcon>
              </ListItemIcon>
              <ListItemText>
                Events
              </ListItemText>
            </ListItem>
          </List>
        </Drawer>
        <main className={classNames(
          classes.content,
          !this.state.isDrawerOpen && classes.contentClose
        )}>
          {
            this.state.panelSelection === "events" &&
            <DatasetEventPage
              onDateChange={this.handleDateChange}
            ></DatasetEventPage>
          }
        </main>
      </div>
    );
  }
}

const mapStateToProps = (state:IRootReducer) => {
  return {
      dataset: state.dataset
  };
}

export default connect(mapStateToProps)(
  withStyles(styles)(DatasetPage)
);
