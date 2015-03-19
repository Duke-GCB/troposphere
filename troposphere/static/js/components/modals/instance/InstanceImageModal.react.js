define(function (require) {

  var React = require('react'),
      Backbone = require('backbone'),
      BootstrapModalMixin = require('components/mixins/BootstrapModalMixin.react'),
      stores = require('stores'),
      Name = require('./request_image/ImageName.react'),
      Description = require('./request_image/ImageDescription.react'),
      Tags = require('./request_image/ImageTags.react'),
      Provider = require('./request_image/ImageProvider.react'),
      Visibility = require('./request_image/ImageVisibility.react'),
      Software = require('./request_image/ImageSoftware.react'),
      SystemFiles = require('./request_image/ImageSystemFiles.react'),
      FilesToExclude = require('./request_image/ImageFilesToExclude.react'),
      LicenseAgreement = require('./request_image/ImageLicenseAgreement.react');

  return React.createClass({
    mixins: [BootstrapModalMixin],

    propTypes: {
      instance: React.PropTypes.instanceOf(Backbone.Model).isRequired
    },

    getInitialState: function () {
      var instance = this.props.instance;

      return {
        name: "",
        description: "",
        tags: stores.InstanceTagStore.getTagsFor(instance),
        providerId: instance.get('provider').id,
        visibility: "public",
        software: "",
        systemFiles: "",
        filesToExclude: "",
        hasAgreedToLicense: false,
        showAdvancedOptions: false
      };
    },

    isSubmittable: function(){
      var hasName            = !!this.state.name;
      var hasDescription     = !!this.state.description;
      var hasProviderTarget  = !!this.state.providerId;
      var hasVisibility      = !!this.state.visibility;
      var hasAgreedToLicense = !!this.state.hasAgreedToLicense;

      return hasName && hasDescription && hasProviderTarget && hasVisibility && hasAgreedToLicense;
    },

    //
    // Mounting
    //

    //
    // Internal Modal Callbacks
    // ------------------------
    //

    toggleAdvancedOptions: function(){
      this.setState({showAdvancedOptions: !this.state.showAdvancedOptions})
    },

    cancel: function(){
      this.hide();
    },

    confirm: function () {
      this.hide();

      var details = {
        name: this.state.name,
        description: this.state.description,
        tags: this.state.tags,
        providerId: this.state.providerId,
        visibility: this.state.visibility,
        software: this.state.software,
        systemFiles: this.state.systemFiles,
        filesToExclude: this.state.filesToExclude,
        hasAgreedToLicense: this.state.hasAgreedToLicense
      };

      this.props.onConfirm(details);
    },

    //
    // Custom Modal Callbacks
    // ----------------------
    //

    handleNameChange: function(name){
      this.setState({name: name});
    },

    handleDescriptionChange: function(description){
      this.setState({description: description});
    },

    onTagAdded: function(tag){
      var tags = this.state.tags;
      tags.add(tag);
      this.setState({tags: tags});
    },

    onTagRemoved: function(tag){
      var tags = this.state.tags;
      tags.remove(tag);
      this.setState({tags: tags});
    },

    handleProviderChange: function(providerId){
      this.setState({providerId: Number(providerId)});
    },

    handleVisibilityChange: function(visibility){
      this.setState({visibility: visibility});
    },

    handleSoftwareChange: function(software){
      this.setState({software: software});
    },

    handleSystemFilesChange: function(systemFiles){
      this.setState({systemFiles: systemFiles});
    },

    handleFilesToExcludeChange: function(filesToExclude){
      this.setState({filesToExclude: filesToExclude});
    },

    handleLicenseAgreementChange: function(hasAgreedToLicense){
      this.setState({hasAgreedToLicense: hasAgreedToLicense});
    },

    //
    // Render
    // ------
    //

    renderAdvancedOptions: function(){
      var toggleOpenStyles = {
        fontSize: "14px",
        borderBottom: "1px solid #ccc",
        fontWeight: "bold"
      };

      var toggleClosedStyles = {
        fontSize: "14px",
        fontWeight: "bold"
      };

      var optionStyles = {
        paddingLeft: "20px"
      };

      if(this.state.showAdvancedOptions){
        return (
          <div>
            <h4 onClick={this.toggleAdvancedOptions} style={toggleOpenStyles}>
              - Hide advanced options
            </h4>
            <Software styles={optionStyles} onChange={this.handleSoftwareChange}/>
            <SystemFiles styles={optionStyles} onChange={this.handleSystemFilesChange}/>
            <FilesToExclude styles={optionStyles} onChange={this.handleFilesToExcludeChange}/>
          </div>
        )
      }else{
        return (
          <div>
            <h4 onClick={this.toggleAdvancedOptions} style={toggleClosedStyles}>
              + Show advanced options
            </h4>
          </div>
        )
      }
    },

    renderBody: function(){
      var instance = this.props.instance;

      return (
        <div>
          <div className="alert alert-danger">
            <strong>Note:</strong> All volumes must be detached from an instance before it can be imaged.
          </div>

          <p className="alert alert-info">
            {"Please read the "}
            <a href="https://pods.iplantcollaborative.org/wiki/x/oIZy" target="_blank">
                wiki page about requesting an image of your instance
            </a>
            {" before completing the form below."}
          </p>

          <Name onChange={this.handleNameChange}/>
          <Description onChange={this.handleDescriptionChange}/>
          <Tags
            instance={instance}
            imageTags={this.state.tags}
            onTagAdded={this.onTagAdded}
            onTagRemoved={this.onTagRemoved}
          />
          <Provider
            providerId={this.state.providerId}
            onChange={this.handleProviderChange}
          />
          <Visibility
            value={this.state.visibility}
            onChange={this.handleVisibilityChange}
          />
          {this.renderAdvancedOptions()}
          <hr/>
          <LicenseAgreement onChange={this.handleLicenseAgreementChange}/>
        </div>
      );
    },

    render: function () {
      return (
        <div className="modal fade">
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                {this.renderCloseButton()}
                <strong>Image Request</strong>
              </div>
              <div className="modal-body">
                {this.renderBody()}
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-danger" onClick={this.cancel}>
                  Cancel
                </button>
                <button type="button" className="btn btn-primary" onClick={this.confirm} disabled={!this.isSubmittable()}>
                  Request Imaging
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    }

  });

});
