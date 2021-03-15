import React from 'react';
import classNames from 'classnames';
import { 
    withStyles, Theme, createStyles, WithStyles 
} from '@material-ui/core/styles';
import { TDatasetHistory } from '../reducers/appConfig';
import { IRootReducer, ConnectedReduxProps } from '../reducers';
import { connect } from 'react-redux';
import { TDataState, TSensorEvent, datasetState_init } from '../reducers/dataset';
import { throttle } from 'lodash';
import SplitPane from 'react-split-pane';
import Draggable from 'react-draggable';
import { TSensor } from '../utils/types.d';
import SensorEventTable from '../components/table/SensorEventTable';
import { Index, RowMouseEventHandlerParams } from 'react-virtualized';
import MomentUtils from '@date-io/moment';
import {MuiPickersUtilsProvider, DatePicker, MaterialUiPickersDate} from 'material-ui-pickers';
import "../css/SplitPane.css"
import SensorEventIllustration from './SensorEventIllustration';
import { TSplitPane } from '../utils/splitPane';
import { IconButton, Typography } from '@material-ui/core';
import Mousetrap from 'mousetrap';
import moment, { isMoment, Moment } from 'moment';

const drawerWidth = 240;

const styles = (theme: Theme) => createStyles({
  pageRoot: {
    width: "100%",
    height: "100%"
  },
  controlBar: {
    height: 64,
    display: 'flex',
    alignItems: 'center'
  },
  contentPane: {
    width: "100%",
    height: "calc(100% - 64px)"
  },
  columnHeader: {
    position: "relative",
    paddingRight: "1rem"
  },
  eventList: {
    width: "100%",
    height: "100%",
    minWidth: 400,
    overflowX: "scroll",
    overflowY: "hidden"
  },
  floorPlan: {
    width: "100%",
    height: "100%",
    alignItems: "center",
    flexDirection: "row",
    display: "flex"
  }
});

interface IStyleProps extends WithStyles<typeof styles> {}

type TReadOnlyProps = {
  onDateChange: (date: MaterialUiPickersDate) => any;
  // showErrorDialog: (title:string, message:string) => void;
  // showProgressDialog: (
  //   message:string, determinate?:boolean, value?:number, total?:number
  // ) => void;
  // hideProgressDialog: () => void;
  // showChangeThemeDialog: () => void;
  // onDatasetOpen: (dataset:TDatasetHistory) => void
};

type TPropsFromState = {
  dataset: TDataState;
}

type TProps = Readonly<TReadOnlyProps> & IStyleProps & TPropsFromState & 
  ConnectedReduxProps<any>;

type TDatasetPanels = "events" | "configuration";

type TState = {
  floorplanWidth: number;
  floorplanHeight: number;
  selectedEventIndex: number;
  autoPlay: boolean;
  timeTag: string;
}

class DatasetEventPage extends React.Component<TProps, TState> {
  splitpaneRef: React.RefObject<SplitPane>;
  sensorEventTableRef: any;
  refreshIntervalId: NodeJS.Timeout | null;

  state = {
    autoPlay: false,
    floorplanWidth: 600,
    floorplanHeight: 400,
    selectedEventIndex: -1,
    timeTag: ""
  }

  constructor(props:TProps) {
    super(props);
    this.splitpaneRef = React.createRef();
    this.sensorEventTableRef = React.createRef();
    this.refreshIntervalId = null;
  }

  componentDidMount() {
    Mousetrap.bind("ctrl+d", () => this.toggleAutoPlay());
    this.handleSplitChange();
  }

  componentWillUnmount() {
    Mousetrap.unbind("ctrl+d");
  }

  toggleAutoPlay() {
    if (this.refreshIntervalId == null || !this.state.autoPlay) {
      this.refreshIntervalId = setInterval(() => this.playNextEvent(), 300);
      this.setState({
        autoPlay: true
      });
    } else {
      clearInterval(this.refreshIntervalId);
      this.refreshIntervalId = null;
      this.setState({
        autoPlay: false
      });
    }
  }

  playNextEvent() {
    this.setState((prevState) => {
      var nextIndex = prevState.selectedEventIndex + 1;
      if (nextIndex == this.props.dataset.eventsToday.length) {
        nextIndex = 0;
      }

      return {
        selectedEventIndex: nextIndex,
        timeTag: this.props.dataset.eventsToday[nextIndex]["timeTag"].format("MM/DD/YYYY HH:mm:ss")
      };
    })
  }

  sensorEventRowGetter = (info: Index) => {
    const {dataset} = this.props;
    return dataset.eventsToday[info.index];
  }

  handleDateChange = (date: MaterialUiPickersDate) => {
    const { onDateChange } = this.props;
    this.setState({
      selectedEventIndex: -1
    });
    onDateChange(date);
  }
  
  handleSplitChange = () => {
    if(this.splitpaneRef && this.splitpaneRef.current) {
      let splitpane = this.splitpaneRef.current as unknown as TSplitPane;
      let totalWidth = splitpane.splitPane.clientWidth;
      let width = splitpane.pane1.clientWidth;
      let height = splitpane.pane2.clientHeight;
      this.setState({
        floorplanWidth: totalWidth - width,
        floorplanHeight: height
      });
    }
  }

  handleSensorEventSelect = (info: RowMouseEventHandlerParams, timeTag: Moment) => {
    console.log("Selected sensor event: ", info.rowData);
    console.log("Selected Index:", info.index);

    this.setState({
      selectedEventIndex: info.index,
      timeTag: timeTag.format("MM/DD/YYYY HH:mm:ss")
    });
  }

  render() {
    const { classes, dataset } = this.props;

    return (
      <div className={classes.pageRoot}>
        <div className={classes.controlBar}>
          <MuiPickersUtilsProvider utils={MomentUtils}>
            <DatePicker
              key="currentDate"
              label="Date:"
              value={dataset.currentDate}
              onChange={this.handleDateChange}
              minDate={dataset.startDate}
              maxDate={dataset.endDate}
            ></DatePicker>
          </MuiPickersUtilsProvider>
          <Typography align="right" style={{
            marginLeft: "64px"
          }}>{this.state.timeTag}</Typography>
        </div>
        <SplitPane className={classes.contentPane}
          ref={this.splitpaneRef}
          split="vertical"
          minSize={50}
          size={"30%"}
          style={{
            height: "calc(100% - 64px)",
            position: "unset"
          }}
          pane1Style={{
            minWidth: "400px"
          }}
          resizerStyle={{
            visibility: "visible"
          }}
          onChange={throttle(this.handleSplitChange, 100)}
          >
          <div className={classes.eventList}>
            <SensorEventTable
              sensorEvents={dataset.eventsToday}
              onRowClick={this.handleSensorEventSelect}
              rowClassName="odd"
              selectedIndex={this.state.selectedEventIndex}
            ></SensorEventTable>
          </div>
          <div className={classes.floorPlan}>
            <SensorEventIllustration 
              width={this.state.floorplanWidth} 
              height={this.state.floorplanHeight}
              selectedIndex={this.state.selectedEventIndex}>
            </SensorEventIllustration>
          </div>
        </SplitPane>
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
  withStyles(styles)(DatasetEventPage)
);
