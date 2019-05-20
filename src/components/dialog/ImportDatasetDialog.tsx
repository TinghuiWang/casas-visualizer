import React from 'react';
import { Theme, createStyles, WithStyles, withStyles } from '@material-ui/core/styles';
import Dialog from '@material-ui/core/Dialog';
import Fade from '@material-ui/core/Fade';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import Button from '@material-ui/core/Button';
import DialogActions from '@material-ui/core/DialogActions';
import { TDatasetType } from '../../utils/dataset';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import FormControl from '@material-ui/core/FormControl';
import InputLabel from '@material-ui/core/InputLabel';
import Input from '@material-ui/core/Input';
import InputAdornment from '@material-ui/core/InputAdornment';
import IconButton from '@material-ui/core/IconButton';
import FolderOpenIcon from '@material-ui/icons/FolderOpen';
import Typography from '@material-ui/core/Typography';
import Electron from 'electron';

const styles = (theme:Theme) => createStyles({
});

interface IStyleProps extends WithStyles<typeof styles> {}

type TReadonlyProps = {
  isOpen: boolean;
  onSubmit: (
    type:TDatasetType, directoryPath:string, sitePath:string, outputPath:string
  ) => void;
  onClose: () => void;
}

type TProps = Readonly<TReadonlyProps> & IStyleProps;

type TState = {
  type: TDatasetType;
  directoryPath: string;
  sitePath: string;
  outputPath: string;
}

class ImportDatasetDialog extends React.Component<TProps, TState> {
  state:TState = {
    type: "directory",
    directoryPath: "",
    sitePath: "",
    outputPath: ""
  }

  handleImportClick = () => {
    const { onSubmit } = this.props;
    onSubmit(
      this.state.type, 
      this.state.directoryPath, 
      this.state.sitePath,
      this.state.outputPath
    );
  }

  handleCancelClick = () => {
    const { onClose } = this.props;
    onClose();
  }

  handleImportTypeChange = (event:React.ChangeEvent<{}>, value:any) => {
    this.setState({
      type: value as TDatasetType
    });
  }

  handleSelectDatasetDirectoryClick = (event:React.MouseEvent) => {
    const folders = Electron.remote.dialog.showOpenDialog({
      title: "Select Dataset Directory",
      defaultPath: Electron.remote.app.getPath("documents"),
      properties: ['createDirectory', 'openDirectory']
    });
    if(folders && folders.length == 1) {
      this.setState({
        directoryPath: folders[0]
      });
    }
  }

  handleSelectSiteDirectoryClick = (event:React.MouseEvent) => {
    const folders = Electron.remote.dialog.showOpenDialog({
      title: "Select Smart Home Site Directory",
      defaultPath: Electron.remote.app.getPath("documents"),
      properties: ['createDirectory', 'openDirectory']
    });
    if(folders && folders.length == 1) {
      this.setState({
        sitePath: folders[0]
      });
    }
  }

  handleSelectOutputDirectoryClick = (event:React.MouseEvent) => {
    const folders = Electron.remote.dialog.showOpenDialog({
      title: "Save Dataset To",
      defaultPath: Electron.remote.app.getPath("documents"),
      properties: ['createDirectory', 'openDirectory']
    });
    if(folders && folders.length == 1) {
      this.setState({
        outputPath: folders[0]
      });
    }
  }


  render() {
    const { classes, isOpen, onClose } = this.props;

    return (
      <Dialog
        open={isOpen}
        TransitionComponent={Fade}
        onClose={onClose}>
        <DialogTitle>
          Import Dataset
        </DialogTitle>
        <DialogContent>
          <Tabs value={this.state.type} 
            indicatorColor="secondary"
            textColor="secondary"
            onChange={this.handleImportTypeChange}>
            <Tab value="directory" label="From Directory" />
            <Tab value="annotationFile" label="From annotation File" />
          </Tabs>
          {
            this.state.type === "directory" &&
            <form>
              <FormControl margin="normal" required fullWidth>
                <InputLabel htmlFor="outputPath">
                  Save Dataset To
                </InputLabel>
                <Input 
                  id="output-path"
                  name="outputPath"
                  value={this.state.outputPath}
                  readOnly={true}
                  endAdornment={<InputAdornment position="end">
                    <IconButton
                      onClick={this.handleSelectOutputDirectoryClick}>
                      <FolderOpenIcon></FolderOpenIcon>
                    </IconButton>
                  </InputAdornment>}
                  onClick={this.handleSelectOutputDirectoryClick}>
                </Input>
              </FormControl>
              <FormControl margin="normal" required fullWidth>
                <InputLabel htmlFor="datasetPath">
                  Dataset Folder
                </InputLabel>
                <Input 
                  id="dataset-path"
                  name="datasetPath"
                  value={this.state.directoryPath}
                  readOnly={true}
                  endAdornment={<InputAdornment position="end">
                    <IconButton
                      onClick={this.handleSelectDatasetDirectoryClick}>
                      <FolderOpenIcon></FolderOpenIcon>
                    </IconButton>
                  </InputAdornment>}
                  onClick={this.handleSelectDatasetDirectoryClick}>
                </Input>
              </FormControl>
              <FormControl margin="normal" required fullWidth>
                <InputLabel htmlFor="sitePath">
                  Smart Home Site Folder
                </InputLabel>
                <Input 
                  id="site-path"
                  name="sitePath"
                  value={this.state.sitePath}
                  readOnly={true}
                  endAdornment={<InputAdornment position="end">
                    <IconButton
                      onClick={this.handleSelectSiteDirectoryClick}>
                      <FolderOpenIcon></FolderOpenIcon>
                    </IconButton>
                  </InputAdornment>}
                  onClick={this.handleSelectSiteDirectoryClick}>
                </Input>
              </FormControl>
            </form>
          }
          {
            this.state.type === "annotationFile" &&
            <Typography variant="caption">
              Not supported yet.
            </Typography>
          }
        </DialogContent>
        <DialogActions>
          <Button onClick={this.handleImportClick}
            variant="contained"
            color="primary" autoFocus>
            Import
          </Button>
          <Button onClick={this.handleCancelClick}
            color="secondary">
            Cancel
          </Button>
        </DialogActions>
      </Dialog>
    );
  }
}

export default withStyles(styles)(ImportDatasetDialog);
