/*
 * Copyright (c) 2012 Francisco Salavert (ICM-CIPF)
 * Copyright (c) 2012 Ruben Sanchez (ICM-CIPF)
 * Copyright (c) 2012 Ignacio Medina (ICM-CIPF)
 *
 * This file is part of JS Common Libs.
 *
 * JS Common Libs is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 2 of the License, or
 * (at your option) any later version.
 *
 * JS Common Libs is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with JS Common Libs. If not, see <http://www.gnu.org/licenses/>.
 */

function GenericFormPanel(args) {
    _.extend(this, Backbone.Events);

    this.analysis;
    this.form = null;
    this.paramsWS = {};
    this.testing = false;
    this.closable = true;

    this.type;
    this.title;
    this.resizable;
    this.width = 500;
    this.height;
    this.taskbar;
    this.bodyPadding;
    this.headerConfig;

    _.extend(this, args);


    this.panelId = this.analysis + "-FormPanel";

    this.runAnalysisSuccess = function (response) {
        if (response.errorMsg !== '') {
            Ext.Msg.show({
                title: "Error",
                msg: response.errorMsg,
                buttons: Ext.Msg.OK,
                icon: Ext.Msg.ERROR
            });
        }
        else console.log(response.data);
    };

    //events attachments
    this.on(this.handlers);

}

GenericFormPanel.prototype.draw = function () {
    var _this = this;
    if (this.panel == null) {
        if (this.type == "window") {
            this.panel = Ext.create('Ext.window.Window', {
                id: this.panelId,
                title: this.title,
                closable: this.closable,
                resizable: this.resizable,
                flex:1,
                overflowY: 'auto',
//                taskbar: this.taskbar,
                items: this.getForm()
            });
        }
        else {
            this.panel = Ext.create('Ext.panel.Panel', {
                id: this.panelId,
                title: this.title,
                closable: this.closable,
//                defaults: {margin: 30},
                style: this.style,
                autoScroll: true,
                items: this.getForm(),
                border: 0,
                bodyPadding: this.bodyPadding,
                header: this.headerConfig,
                listeners: {
                    beforeclose: function () {
                        _this.panel.up().remove(_this.panel, false);
                        console.log('closing');
                        return false;
                    }
                }
            });
        }
    }
    return this.panel;
};


GenericFormPanel.prototype.show = function () {
    if (typeof this.panel !== 'undefined') {
        this.panel.show();
    }
};

GenericFormPanel.prototype.hide = function () {
    if (typeof this.panel !== 'undefined') {
        this.panel.hide();
    }
};

GenericFormPanel.prototype.getForm = function () {
    if (this.form == null) {
        var items = this.getPanels();
        items.push(this.getJobPanel());
        items.push(this.getRunButton());

        this.form = Ext.create('Ext.form.Panel', {
            border: 0,
            bodyPadding: '5',
            width: this.width,
            layout: 'vbox',
            items: items
        });
    }

    return this.form;
};

GenericFormPanel.prototype.getPanels = function () {
    // To be implemented in inner class
};

GenericFormPanel.prototype.getJobPanel = function () {
    var _this = this;
    var jobNameField = Ext.create('Ext.form.field.Text', {
        id: this.id + "jobname",
        name: "jobname",
        fieldLabel: 'Name',
        emptyText: "Job name",
        allowBlank: false,
        margin: '5 0 0 5'
    });

    var jobDescriptionField = Ext.create('Ext.form.field.TextArea', {
        id: this.id + "jobdescription",
        name: "jobdescription",
        fieldLabel: 'Description',
        emptyText: "Description",
        margin: '5 0 0 5'
    });

//	var bucketList= Ext.create('Ext.data.Store', {
//		fields: ['value', 'name'],
//		data : [
//		        {"value":"default", "name":"Default"}
//		       ]
//	});
//	var jobDestinationBucket = this.createCombobox("jobdestinationbucket", "Destination bucket", bucketList, 0, 100);
    var jobFolder = this.createOpencgaBrowserCmp({
        id: Utils.genId('jobFolder'),
        fieldLabel: 'Folder:',
        dataParamName: 'outdir',
        mode: 'folderSelection',
        btnMargin: '0 0 0 66',
        defaultFileLabel: 'Default job folder',
        allowBlank: true
    });

    var jobPanel = Ext.create('Ext.panel.Panel', {
        title: 'Job',
        header: this.headerFormConfig,
        border: true,
        bodyPadding: "5",
        margin: "0 0 5 0",
        width: '99%',
        buttonAlign: 'center',
        items: [jobNameField, jobDescriptionField, jobFolder]
    });

    return jobPanel;
};

GenericFormPanel.prototype.getRunButton = function () {
    var _this = this;
    return Ext.create('Ext.button.Button', {
        text: 'Run',
        width: 300,
        height: 35,
        disabled: true,
        margin: '10 0 0 0',
        cls: 'btn btn-default',

        formBind: true, // only enabled if the form is valid
        handler: function () {
            var formParams = _this.getForm().getForm().getValues();
            for (var param in formParams) {
                _this.paramsWS[param] = formParams[param];
            }
            _this.beforeRun();
            _this.run();
        }
    });
};

GenericFormPanel.prototype.setAccountParams = function () {
    this.paramsWS["sessionid"] = $.cookie('bioinfo_sid');
    this.paramsWS["accountid"] = $.cookie('bioinfo_account');
};

GenericFormPanel.prototype.beforeRun = function () {
    // To be implemented in inner class

};

GenericFormPanel.prototype.run = function () {
    this.setAccountParams();
    (this.paramsWS['outdir'] === '') ? delete this.paramsWS['outdir'] : console.log(this.paramsWS['outdir']);

    if (!this.testing) {
        OpencgaManager.runAnalysis({
            analysis: this.analysis,
            paramsWS: this.paramsWS,
            success: this.runAnalysisSuccess
        });
    }

    Ext.example.msg('Job Launched', 'It will be listed soon');
    //debug
    console.log(this.paramsWS);
    this.trigger('after:run', {sender: this});
};


/////////////////////////////////////////
/////////////////////////////////////////
//Functions to create sencha components//
/////////////////////////////////////////
/////////////////////////////////////////
GenericFormPanel.prototype.createCombobox = function (name, label, data, defaultValue, labelWidth, margin) {
    return Ext.create('Ext.form.field.ComboBox', {
        id: name,
        name: name,
        fieldLabel: label,
        store: data,
        queryMode: 'local',
        displayField: 'name',
        valueField: 'value',
        value: data.getAt(defaultValue).get('value'),
        labelWidth: labelWidth,
        margin: margin,
        editable: false,
        allowBlank: false
    });
};

GenericFormPanel.prototype.createCheckBox = function (name, label, checked, margin, disabled, handler) {
    return Ext.create('Ext.form.field.Checkbox', {
        id: name,
        name: name,
        boxLabel: label,
        checked: (checked || false),
        disabled: disabled,
        margin: (margin || '0 0 0 0')
    });
};

GenericFormPanel.prototype.createRadio = function (name, group, checked, hidden) {
    var cb = Ext.create('Ext.form.field.Radio', {
        id: name + "_" + this.id,
        boxLabel: name,
        inputValue: name,
        checked: checked,
        name: group,
        hidden: hidden
    });
    return cb;
};

GenericFormPanel.prototype.createLabel = function (text, margin) {
    var label = Ext.create('Ext.form.Label', {
        id: text + "_" + this.id,
        margin: (margin || "15 0 0 0"),
        html: '<span class="emph">' + text + '</span>'
    });
    return label;
};
GenericFormPanel.prototype.createTextFields = function (name) {
    var tb = Ext.create('Ext.form.field.Text', {
        id: name + "_" + this.id,
        fieldLabel: name,
        name: name
//		allowBlank: false
    });
    return tb;
};


GenericFormPanel.prototype.createOpencgaBrowserCmp = function (args) {//fieldLabel, dataParamName, mode, btnMargin, defaultFileLabel
    var _this = this;
    var btnBrowse = Ext.create('Ext.button.Button', {
        text: 'Browse...',
        margin: args.btnMargin || '0 0 0 10',
        handler: function () {
            if (args.beforeClick != null) {
                args.beforeClick(args);
            }
            _this.opencgaBrowserWidget.once('select', function (response) {
                var label = 'buckets/' + response.bucketId + '/' + response.id;
                var value = 'buckets:' + response.bucketId + ':' + response.id.replace(/\//g, ":");
                fileSelectedLabel.setText('<span class="emph">' + label + '</span>', false);
                hiddenField.setValue(value);//this is send to the ws
            });
            _this.opencgaBrowserWidget.show({mode: args.mode, allowedTypes: args.allowedTypes});
        }
    });

    var fileSelectedLabel = Ext.create('Ext.form.Label', {
        id: args.id,
        text: args.defaultFileLabel || "No file selected",
        margin: '5 0 0 15'
    });

    //not shown, just for validation
    var hiddenField = Ext.create('Ext.form.field.Text', {
        id: args.id + 'hidden',
        name: args.dataParamName,
        hidden: true,
        allowBlank: (args.allowBlank || false),
        margin: '5 0 0 15'
    });

    return Ext.create('Ext.container.Container', {
//		bodyPadding:10,
//		defaults:{margin:'5 0 0 5'},
        margin: '5 0 5 0',
        items: [
            {xtype: 'label', text: args.fieldLabel, margin: '5 0 0 5'},
            btnBrowse,
            fileSelectedLabel,
            hiddenField
        ]
    });
};
