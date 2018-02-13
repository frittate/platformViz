import {Meteor} from 'meteor/meteor';
import {Tracker} from 'meteor/tracker';

import {Mongo} from 'meteor/mongo';
import {Configuration} from '../imports/api/configuration';

import Chart from 'chart.js';
//import sparkline from '../imports/api/jquery.sparkline';

Meteor.startup(() => {

let db = {
    sets: [],
}
  
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
      
  },

  calculateTutors: function(){
      //debugger;
      let tutors = this.inputData.tutorsInit;
      for (i=0;i<this.inputData.iterations;i++) {
          tutors = tutors - (tutors * (this.inputData.tutorsExit / 100)) + this.inputData.tutorsNew + (this.inputData.studentsInit * (this.inputData.renegades / 100)) + (tutors * (this.inputData.tutorsViral / 100));            
          this.chartedData.chartedTutors[i] = parseInt(tutors).toFixed(2);
      }
      this.chartedData.chartedTutors.splice(this.inputData.iterations, this.chartedData.chartedTutors.length);
      
  },

  calculateStudents: function(){
      let students = this.inputData.studentsInit;
      
      for (i=0;i<this.inputData.iterations;i++) {
          students = students - (students * (this.inputData.studentsExit / 100)) + this.inputData.studentsNew + (students * (this.inputData.studentsViral / 100));
          this.chartedData.chartedStudents[i] = parseInt(students).toFixed(2);
        }
        this.chartedData.chartedStudents.splice(this.inputData.iterations, this.chartedData.chartedStudents.length);

  },

  calculateRate: function(){
    
    let cTutors = this.chartedData.chartedTutors;
    let cStudents = this.chartedData.chartedStudents;
    this.chartedData.rate = cTutors[cTutors.length -1] / cStudents[cStudents.length - 1];
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
        this.updateSets(db.sets);
    },

    updateSlider: function(field, value){
        field.innerHTML = value + "%";
    },

    updateDisplay: function(){
      rateDisplay.innerHTML = model.chartedData.rate.toFixed(2);
      controller.chartConfig.data.labels = model.chartedData.intervals;
      controller.chartConfig.options.title.text = `# of tutors and students after ${model.inputData.iterations} iterations.`;
      myLine.update();
    },

    loadAllSets: function(){
        db.sets = Configuration.find().fetch();
        this.updateSets(db.sets);
    }, 

    updateSets: function(sets){
        
        if (sets.length == 0 || sets == undefined) {
            this.outputs.savedSets.innerHTML = `<button class="btn" id='loadAllSets'>Reload Sets</button>`;
            document.getElementById('loadAllSets').addEventListener("click", function(){
                view.loadAllSets();
            }, false);
        } else {
            this.outputs.savedSets.innerHTML = this.renderSets(sets);

            let savedSetsList = document.getElementById('savedSets');
            let savedSetsItems = savedSetsList.getElementsByTagName('li');

            for(i=0;i<savedSetsItems.length;i++){
                savedSetsItems[i].querySelector('#loadButton').addEventListener('click', function(){
                    controller.loadSet(this.parentNode.id);
                }, false);

                savedSetsItems[i].querySelector('#deleteButton').addEventListener('click', function(){
                    controller.deleteSet(this.parentNode.id);
                }, false);

                $('li.savedSetsItems > div > .tutorsparkline').each(function(i){
                    $(this).sparkline(sets[i].chartedTutors, controller.fields.sparkOptionsTutors);
                });

                $('li.savedSetsItems > div > .studentsparkline').each(function(i){
                    $(this).sparkline(sets[i].chartedStudents, controller.fields.sparkOptionsStudents);
                });
            }
        }
    }, 

    renderSets: function(sets){

        loadCurrentButton = () => {
            return `<button id="loadButton" class="btn">Load</button>`
        };
  
        deleteCurrentButton = () => {
            return `<button id="deleteButton" class="btn">Delete this</button>`
        };

        html = "";
          for (i=0;i<sets.length;i++) {
            html += `<li key=${sets[i]._id} id=${sets[i]._id} class="savedSetsItems">
                    <h3 class="setname">Set #${i+1}</h3>
                    <h3>${sets[i].date}</h3>
                    <div><i class="fas fa-user tutors-icon"></i> ${sets[i].tutorsInit}</div>
                    <div><i class="fas fa-user-plus tutors-icon"></i> ${sets[i].tutorsNew}</div>
                    <div><i class="fas fa-user-times tutors-icon"></i> ${sets[i].tutorsExit} %</div>
                    <div><i class="fas fa-share-alt tutors-icon"></i> ${sets[i].tutorsViral} %</div>

                    <div class="sparkline"><span class="tutorsparkline">Loading...</span></div>

                    <div><i class="fas fa-user students-icon"></i> ${sets[i].studentsInit}</div>
                    <div><i class="fas fa-user-plus students-icon"></i> ${sets[i].studentsNew}</div>
                    <div><i class="fas fa-user-times students-icon"></i> ${sets[i].studentsExit} %</div>
                    <div><i class="fas fa-share-alt students-icon"></i> ${sets[i].studentsViral} %</div>
                    <div><i class="fas fa-random students-icon"></i> ${sets[i].renegades} %</div>

                    <div class="sparkline"><span class="studentsparkline">Loading...</span></div>

                    <div><i class="fas fa-stopwatch students-icon"></i> ${sets[i].iterations}</div>
                    ${loadCurrentButton()}
                    ${deleteCurrentButton()}
                    </li>`;
          }
          return html;
    }, 

    
   
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

        this.fields.configurations.currentConfig = document.getElementById('currentConfig');
        this.fields.configurations.addSet = document.getElementById('addSet');
        this.fields.configurations.clearAllSets = document.getElementById('clearAllSets');
                
        model.chartedData.intervals = Array.from(new Array(parseInt(model.inputData.iterations)),(val, index) => index +1);
    },

    updateAll: function(){
      model.recalculate();
      view.updateDisplay();
    },

    addFieldListeners: function(){
        //console.log("add fields");
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

      iC = this.fields.configurations;

        iC.addSet.addEventListener("click", function(){
            controller.saveSet();
        }, false);

        iC.clearAllSets.addEventListener("click", function(){
            controller.clearAllSets();
        }) 


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
          }],
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
        configurations: {
            currentConfig: {},
            addSet: {},
            clearAllSets: {},
        },
        sparkOptionsStudents: {
            type: 'line',
            fillColor: '#98dafc',
            minSpotColor: false,
            maxSpotColor: false,
            lineColor: '#98dafc',
            width: '60px',
            disableInteraction: true,
        },
        sparkOptionsTutors: {
            type: 'line',
            fillColor: '#daad86',
            minSpotColor: false,
            maxSpotColor: false,
            lineColor: '#daad86',
            width: '60px',
            disableInteraction: true,
        }

    },

     saveSet: function(){

        insertSaveTime = () => {
            let d = new Date();
            let fullDate = {
               date: `${d.getDate()}.${d.getMonth() + 1}.${d.getFullYear()} ${d.getHours()}:${d.getMinutes()}`
            };
            return fullDate;
        }

        let dbWrite = Object.assign(model.inputData, model.chartedData, insertSaveTime());
        Configuration.insert(
            dbWrite
        );
        view.loadAllSets();
    },

    loadSet: function(id){
        let loaded = Configuration.find({_id: id}).fetch();
        model.inputData = loaded[0];
        let iF = this.fields.inputFields;
        let iS = this.fields.sliders;

        iF.tutorInitField.value = model.inputData.tutorsInit;
        iF.tutorNewField.value = model.inputData.tutorsNew;
        iF.studentInitField.value = model.inputData.studentsInit;
        iF.studentNewField.value = model.inputData.studentsNew;
        iF.iterationsField.value = model.inputData.iterations;
        
        iS.tutorExitSlider.value = model.inputData.tutorsExit;
        document.getElementById('tutorExitOutput').value = model.inputData.tutorsExit + '%';

        iS.tutorViralSlider.value = model.inputData.tutorsViral;
        document.getElementById('tutorViralOutput').value = model.inputData.tutorsViral + '%';

        iS.studentExitSlider.value = model.inputData.studentsExit;
        document.getElementById('studentExitOutput').value = model.inputData.studentsExit + '%';

        iS.studentViralSlider.value = model.inputData.studentsViral;
        document.getElementById('studentViralOutput').value = model.inputData.studentsViral + '%';

        iS.renegadeSlider.value = model.inputData.renegades;
        document.getElementById('renegadeOutput').value = model.inputData.renegades + '%';
       
        controller.updateAll();
    },

    deleteSet: function(id){
        Configuration.remove({_id: id});
        view.loadAllSets();
    },

    clearAllSets: function(){
        let r = confirm("Do you want to delete all sets?");
        if (r) {
            Meteor.call('clearDB');
            location.reload(true);
            view.updateSets(db.sets);
        }

    }  
};

    
    controller.setup();
    controller.addFieldListeners();
    model.recalculate();
    view.setup();
    myLine.update();
    
});



