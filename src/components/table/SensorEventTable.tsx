import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { withStyles, Theme, createStyles, WithStyles } from '@material-ui/core/styles';
import {fade} from '@material-ui/core/styles/colorManipulator';
import TableCell from '@material-ui/core/TableCell';
import TableSortLabel from '@material-ui/core/TableSortLabel';
import Paper from '@material-ui/core/Paper';
import { 
  AutoSizer, Table, Column, Index, 
  defaultTableHeaderRenderer, TableCellDataGetterParams, TableHeaderRenderer, TableHeaderProps, TableCellProps, RowMouseEventHandlerParams
} from 'react-virtualized';
import { ConnectedReduxProps } from '../../reducers';
import { TSensorEvent } from '../../reducers/dataset';
import { createPropsGetter } from '../../utils/props';
import "../../css/ReactVirtualized.css"
import Typography from '@material-ui/core/Typography';
import Chip from '@material-ui/core/Chip';
import { Moment } from 'moment';

const styles = (theme:Theme) => createStyles({
  autoSizer: {
  },
  flexContainer: {
    display: 'flex',
    alignItems: 'center',
    boxSizing: 'border-box',
  },
  tableRow: {
    cursor: 'pointer',
  },
  tableRowHover: {
    '&:hover': {
      backgroundColor: fade(theme.palette.grey[200], 0.1),
    }
  },
  tableRowSelected: {
    backgroundColor: fade(theme.palette.grey[200], 0.1)
  },
  tableCell: {
    flex: 1,
    padding: 4,
    '&:last-child': {
      paddingRight: 4
    }
  },
  noClick: {
    cursor: 'initial',
  },
});

interface IStyleProps extends WithStyles<typeof styles> {}

type TReadOnlyProps = {
  rowClassName: string;
  onRowClick: (info: RowMouseEventHandlerParams, timeTag: Moment) => any;
  sensorEvents: Array<TSensorEvent>;
  selectedIndex: number;
} & Partial<TDefaultProps>;

type TDefaultProps = Readonly<typeof defaultProps>;

type TPropsFromState = {}

type TProps = Readonly<TReadOnlyProps> & IStyleProps & TPropsFromState;

type TState = {
  rowSelected: number;
}

const defaultProps = {
  rowHeight: 50 as number,
  headerHeight: 40 as number,
  selectedIndex: 0 as number
}

const getProps = createPropsGetter(defaultProps);

type TSensorEventTableColumn = {
  label: string;
  dataKey: string;
  dataGetter: (sensorEvent:TSensorEvent) => any;
  align?: 'inherit' | 'left' | 'center' | 'right' | 'justify';
  className?: string;
  width: number;
  flexGrow?: number;
}

const sensorEventColumns:Array<TSensorEventTableColumn> = [
  {
    label: "Time Tag",
    dataGetter: (sensorEvent:TSensorEvent) => {
      return sensorEvent.timeTag.format("MM/DD/YYYY HH:mm:ss");
    },
    align: "left",
    dataKey: "timeTag",
    width: 200,
    flexGrow: 1.0
  },
  {
    label: "Sensor ID",
    dataGetter: (sensorEvent:TSensorEvent) => {
      return sensorEvent.sensorId;
    },
    align: "left",
    dataKey: "sensorId",
    width: 200
  },
  {
    label: "Sensor Message",
    dataGetter: (sensorEvent:TSensorEvent) => {
      return sensorEvent.sensorMsg;
    },
    align: "left",
    dataKey: "sensorMsg",
    width: 100
  },
  {
    label: "Residents",
    dataGetter: (sensorEvent:TSensorEvent) => {
      return sensorEvent.residents.map((resident, index) => {
          return (
            <Chip 
              variant="outlined" 
              style={{
                color: resident.color.substr(0, 7),
                borderColor: resident.color.substr(0, 7)
              }}
              label={resident.name}>
            </Chip>
          );
        });
    },
    align: "left",
    dataKey: "residents",
    width: 120
  },
  {
    label: "Activities",
    dataGetter: (sensorEvent:TSensorEvent) => {
      return sensorEvent.activities.map((activity, index) => {
        return (
          <Chip 
            variant="outlined" 
            style={{
              color: activity.color.substr(0, 7),
              borderColor: activity.color.substr(0, 7)
            }}
            label={activity.name}>
          </Chip>
        );
      });
    },
    align: "left",
    dataKey: "activities",
    width: 200,
    flexGrow: 1
  }
]

class SensorEventTable extends React.Component<TProps, TState> {
  static defaultProps = defaultProps;
  state:TState = {
    rowSelected: -1
  }

  static getDerivedStateFromProps(nextProps: TProps, prevState: TState) : TState {
    return {
      rowSelected: nextProps.selectedIndex
    };
  }

  getRowClassName = (info:Index) => {
    const { classes, rowClassName, onRowClick } = this.props;

    return classNames(classes.tableRow, classes.flexContainer, rowClassName, {
      [classes.tableRowHover]: info.index !== -1 && onRowClick != null,
      [classes.tableRowSelected]: info.index !== -1 && info.index === this.state.rowSelected
    });
  };

  tableRowGetter = (info:Index) => {
    const {sensorEvents} = this.props;
    return sensorEvents[info.index];
  }
  
  cellRenderer = (cellProps:TableCellProps, columnIndex:number) => {
    const { classes, rowHeight, onRowClick } = getProps(this.props);
    let cellData;
    let cellDataGetter;

    if(sensorEventColumns[columnIndex].dataGetter) {
      cellData = sensorEventColumns[columnIndex].dataGetter(cellProps.rowData);
    } else {
      cellData = cellProps.cellData
    }

    return (
      <TableCell
        component="div"
        className={classNames(
          classes.tableCell, classes.flexContainer, {
            [classes.noClick]: onRowClick == null,
          }
        )}
        variant="body"
        style={{ height: rowHeight }}
        align="left">
        {cellData}
      </TableCell>
    );
  };

  headerRenderer = (headerProps:TableHeaderProps, columnIndex:number) => {
    const { headerHeight, classes } = getProps(this.props);

    return (
      <TableCell
        component='div'
        className={classNames(
          classes.tableCell, classes.flexContainer, classes.noClick
        )}
        variant='head'
        style={{ height: headerHeight }}
        align={sensorEventColumns[columnIndex].align}
      >
        {sensorEventColumns[columnIndex].label}
      </TableCell>
    );
  }

  handleRowClick = (info: RowMouseEventHandlerParams) => {
    const {onRowClick} = getProps(this.props);
    this.setState((state:TState) => ({
      rowSelected: (state.rowSelected === info.index) ? -1 : info.index
    }));

    onRowClick(info, this.props.sensorEvents[info.index]["timeTag"]);
  }

  render() {
    const { 
      classes, sensorEvents, rowHeight, headerHeight
    } = getProps(this.props);
    return (
      <AutoSizer className={classes.autoSizer}>
        {({ height, width }) => (
          <Table 
            height={height}
            width={width} 
            rowHeight={rowHeight}
            headerHeight={headerHeight}
            rowClassName={this.getRowClassName}
            rowCount={sensorEvents.length}
            rowGetter={this.tableRowGetter}
            onRowClick={this.handleRowClick}
            scrollToIndex={this.state.rowSelected}
            > 
            {sensorEventColumns.map((columnInfo, index) => {
              let dataKey = sensorEventColumns[index].dataKey;

              return (
                <Column
                  key={dataKey}
                  headerRenderer={(headerProps:TableHeaderProps) =>
                    this.headerRenderer(headerProps, index)
                  }
                  className={
                    classNames(classes.flexContainer, columnInfo.className)
                  }
                  cellRenderer={(cellProps:TableCellProps) => 
                    this.cellRenderer(cellProps, index)
                  }
                  dataKey={dataKey}
                  flexGrow={columnInfo.flexGrow}
                  width={columnInfo.width}
                />
              );
            })}
          </Table>
        )}
      </AutoSizer>
    );
  }
}

export default withStyles(styles)(SensorEventTable);
