define(function (require) {

  var React = require('react'),
      _ = require('underscore'),
      Machine = require('./Machine.react'),
      stores = require('stores');

  return React.createClass({

    propTypes: {
      machines: React.PropTypes.instanceOf(Backbone.Collection).isRequired,
      editable: React.PropTypes.bool
    },

    renderMachine: function(machine){
      return (
        <Machine
          key={machine.id}
          machine={machine}
          editable={this.props.editable}
        />
      );
    },
     showMachineEditModal: function (machine) {
         actions.ProviderMachineActions.edit(machine, this.props.application);
     },
    render: function () {
      var machines = _.uniq(this.props.machines.models, function(m){
        return m.get('uuid');
      });

      return (
        <div className="content col-md-10">
          <ul>
            {machines.map(this.renderMachine)}
          </ul>
        </div>
      );
    }

  });

});
