import {Meteor} from 'meteor/meteor';
import {Tracker} from 'meteor/tracker';

import {Mongo} from 'meteor/mongo';

import Chart from 'chart.js';

//Configuration = new Mongo.Collection('configuration');

Meteor.startup(() => {
  

let model = {
  inputData: {
    tutors: 0,
    tutorsInit: 1000,
    tutorsExit: 10,
    tutorsNew: 10,
    tutorsViral: 3,
    studentsInit: 100,
    studentsExit: 5,
    studentsNew: 10,
    studentsViral: 2,
    renegades: 7,
    iterations: 10,
  },

  chartedData: {
      intervals: [],
      chartedTutors: [],
      chartedStudents: [],
      rate: 0,
  },

  recalculate: function(){
      this.calculateIterations();
      this.calculateTutors();
      this.calculateStudents();
      this.calculateRate();
  },

  calculateIterations: function(){
      model.chartedData.intervals = Array.from(new Array(parseInt(model.inputData.iterations)),(val, index) => index +1);  
      console.log(model.chartedData.intervals);
  },

  calculateRate: function(){
      let cTutors = this.chartedData.chartedTutors;
      let cStudents = this.chartedData.chartedStudents;
      this.chartedData.rate = cTutors[cTutors.length -1] / cStudents[cStudents.length - 1];
  },

  calculateTutors: function(){
      let tutors = this.inputData.tutorsInit;
      for (i=0;i<this.inputData.iterations;i++) {
          tutors = tutors - (tutors * (this.inputData.tutorsExit / 100)) + this.inputData.tutorsNew + (this.inputData.studentsInit * (this.inputData.renegades / 100)) + (tutors * (this.inputData.tutorsViral / 100));            
          this.chartedData.chartedTutors[i] = parseInt(tutors).toFixed(2);
      }
      console.log(this.chartedData.chartedTutors);
  },

  calculateStudents: function(){
      let students = this.inputData.studentsInit;
      for (i=0;i<this.inputData.iterations;i++) {
          students = students - (students * (this.inputData.studentsExit / 100)) + this.inputData.studentsNew + (students * (this.inputData.studentsViral / 100));
          this.chartedData.chartedStudents[i] = parseInt(students).toFixed(2);
        }
      console.log(this.chartedData.chartedStudents);
  },

};

let view = {
    CHART: document.getElementById('lineChart').getContext('2d'),
    
    outputs: {
        rateDisplay: {},
        tutorExitOutput: {},
        tutorViralOutput: {},
        studentExitOutput: {},
        studentViralOutput: {},
        renegadeOutput: {},
        savedSets: {},
    },

    setup: function(){
        this.outputs.rateDisplay = document.getElementById('rateDisplay');
        this.outputs.tutorExitOutput = document.getElementById('tutorExitOutput');
        this.outputs.tutorViralOutput = document.getElementById('tutorViralOutput');
        this.outputs.studentExitOutput = document.getElementById('studentExitOutput');
        this.outputs.studentViralOutput = document.getElementById('studentViralOutput');
        this.outputs.renegadeOutput = document.getElementById('renegadeOutput');
        this.outputs.savedSets = document.getElementById('savedSets');
        view.CHART.canvas.width = "95%";
        view.CHART.canvas.height = "90%";
        myLine = new Chart(view.CHART, controller.chartConfig);
        controller.chartConfig.data.labels = model.chartedData.intervals;
        //this.updateSets(db.sets);
    },

    updateSlider: function(field, value){
        field.innerHTML = value + "%";
    },

    updateDisplay: function(){
      rateDisplay.innerHTML = model.chartedData.rate.toFixed(2);
      controller.chartConfig.data.labels = model.chartedData.intervals;
      myLine.update();
    },

  /*   updateSets: function(sets){
        if (sets.length == 0 || sets.length == undefined) {
            this.outputs.savedSets.innerHTML = '<li>currently empty</li>';
        } else {
            this.outputs.savedSets.innerHTML = this.renderSets(sets);
        }
    }, 

    renderSets: function(sets){

        loadCurrentButton = (id) => {
            return `<button id=${id} onClick=controller.loadSet(event)>Load</button>`
        };
  
        deleteCurrentButton = (id) => {
            return `<button id=${id} onClick='deleteCurrent(event)'>Delete this</button>`
        };

        html = "";
          for (i=0;i<sets.length;i++) {
            html += `<li key=${sets[i]._id}> 
                    Tutors: ${sets[i].tutorsInit}, 
                    TutorsExit: ${sets[i].tutorsExit},
                    TutorsNew: ${sets[i].tutorsNew},
                    TutorsViral: ${sets[i].tutorsViral}, 
                    ${loadCurrentButton(sets[i]._id)}
                    ${deleteCurrentButton(sets[i]._id)}
                    </li>`;
          }
          return html;
    }, */
   
};

let controller = {
    setup: function(){
        this.fields.inputFields.iterationsField = document.getElementById('iterationsField');
        this.fields.inputFields.tutorInitField = document.getElementById('tutorInitField');
        this.fields.inputFields.tutorNewField = document.getElementById('tutorNewField');
        this.fields.inputFields.studentInitField = document.getElementById('studentInitField');
        this.fields.inputFields.studentNewField = document.getElementById('studentNewField');

        this.fields.sliders.tutorExitSlider = document.getElementById('tutorExitSlider');
        this.fields.sliders.tutorViralSlider = document.getElementById('tutorViralSlider');
        this.fields.sliders.studentExitSlider = document.getElementById('studentExitSlider');
        this.fields.sliders.studentViralSlider = document.getElementById('studentViralSlider');
        this.fields.sliders.renegadeSlider = document.getElementById('renegadeSlider');

       //this.fields.configurations.currentConfig = document.getElementById('currentConfig');
        //this.fields.configurations.addSet = document.getElementById('addSet');
       //this.fields .configurations.clearAllSets = document.getElementById('clearAllSets');
                
        model.chartedData.intervals = Array.from(new Array(parseInt(model.inputData.iterations)),(val, index) => index +1);
    },

    updateAll: function(){
      model.recalculate();
      view.updateDisplay();
    },

    addFieldListeners: function(){
        console.log("add fields");
        iF = this.fields.inputFields;

        iF.tutorInitField.addEventListener("input", function(){
            model.inputData.tutorsInit = parseInt(iF.tutorInitField.value);
            controller.updateAll();
        }, false);

        iF.tutorNewField.addEventListener("input", function(){
            model.inputData.tutorsNew = parseInt(iF.tutorNewField.value);
            controller.updateAll();
        }, false);

        iF.studentInitField.addEventListener("input", function(){
            model.inputData.studentsInit = parseInt(iF.studentInitField.value);
            controller.updateAll();
        }, false);

        iF.studentNewField.addEventListener("input", function(){
            model.inputData.studentsNew = parseInt(iF.studentNewField.value);
            controller.updateAll();
        }, false);

        iF.iterationsField.addEventListener("input", function(){
            model.inputData.iterations = iF.iterationsField.value;
            controller.updateAll();
        }, false);

        iS = this.fields.sliders;

        iS.tutorExitSlider.addEventListener("input", function(){
            model.inputData.tutorsExit = iS.tutorExitSlider.value;
            view.updateSlider(view.outputs.tutorExitOutput, model.inputData.tutorsExit);
            controller.updateAll();
        }, false);

        iS.tutorViralSlider.addEventListener("input", function(){
          model.inputData.tutorsViral = iS.tutorViralSlider.value;
          view.updateSlider(view.outputs.tutorViralOutput, model.inputData.tutorsViral);
          controller.updateAll();
        }, false);

        iS.studentExitSlider.addEventListener("input", function(){
          model.inputData.studentsExit = iS.studentExitSlider.value;
          view.updateSlider(view.outputs.studentExitOutput, model.inputData.studentsExit);
          controller.updateAll();
        }, false);

        
        iS.studentViralSlider.addEventListener("input", function(){
          model.inputData.studentsViral = iS.studentViralSlider.value;
          view.updateSlider(view.outputs.studentViralOutput, model.inputData.studentsViral);
          controller.updateAll();
        }, false);

        iS.renegadeSlider.addEventListener("input", function(){
          model.inputData.renegades = iS.renegadeSlider.value;
          view.updateSlider(view.outputs.renegadeOutput, model.inputData.renegades);
          controller.updateAll();
        }, false);

       /*  iC = this.fields.configurations;

        iC.addSet.addEventListener("click", function(){
            controller.saveSet();
        }, false);

        iC.clearAllSets.addEventListener("click", function(){
            controller.clearAllSets();
        }) */


    },

    chartConfig: {
      type: 'line',
      data: {
        labels: model.chartedData.intervals,
        datasets: [{ 
            data: model.chartedData.chartedTutors,
            label: "Tutors",
            borderColor: "#DAAD86",
            borderWidth: 3,
            fill: false,
            pointRadius: 1,
            }, 
            {
            data: model.chartedData.chartedStudents,
            label: "Students",
            borderColor: "#98DAFC",
            borderWidth: 3,
            fill: false,
            pointRadius: 1,
            },
        ]
      },
      options: {
        title: {
          display: true,
          text: `# of tutors and students after ${model.inputData.iterations} iterations.`,
        },
        scales: {
          xAxes: [{
            ticks: {
              stepSize: 1,
              autoSkipPadding: 5,
            }
          }]
        },
        animation: {
          duration: 700,
        },
      }
    },
        
    fields: {
        inputFields: {
            iterationsField: {},
            tutorInitField: {},
            tutorNewField: {},
            studentInitField: {},
            studentNewField: {},
        },
        sliders: {
            tutorExitSlider: {},
            tutorViralSlider: {},
            studentExitSlider: {},
            studentViralSlider: {},
            renegadeSlider: {},
        },
        displays: {
            rateDisplay: {},
            tutorViralOutput: {},
            studentExitOutput: {},
            studentViralOutput: {},    
            renegadeOutput: {},
            
        },
        configurations: {
            currentConfig: {},
            addSet: {},
            clearAllSets: {},
        }
    },

/*     saveSet: function(){
        debugger;
        Configuration.insert(
            model.inputData
        );
        console.log('after saving a new set');
        db.sets = Configuration.find().fetch();
        console.log(db.sets);
        view.updateSets(db.sets);
    },

    loadSet: function(event){
        let loaded = Configuration.find({_id: event.target.id}).fetch();
        model.inputData.tutorsInit = loaded[0].tutorsInit;
        controller.updateAll();
    },

    clearAllSets: function(){
        let r = confirm("Do you want to delete all sets?");
        if (r) {
            Meteor.call('clearDB');
            view.updateSets();
        }
    }  */
};

    
    controller.setup();
    controller.addFieldListeners();
    model.recalculate();
    view.setup();
    myLine.update();
    
});



