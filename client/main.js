import {Meteor} from 'meteor/meteor';
import {Tracker} from 'meteor/tracker';
import React from 'react'; 
//import ReactDOM from 'react-dom';

//import App from './../imports/ui/App';

import {Mongo} from 'meteor/mongo';
import {Configuration} from './../imports/api/configuration';

import Chart from 'chart.js';

Meteor.startup(() => {
    Tracker.autorun(() => {
      let rateDisplay = document.getElementById('rateDisplay');

      let iterationsField = document.getElementById('iterationsField');
      let iterations = parseInt(iterationsField.value);

      let tutorInitField = document.getElementById('tutorInitField');
      let tutors = parseInt(tutorInitField.value);

      let tutorExitSlider = document.getElementById('tutorExitSlider');
      let tutorExitOutput = document.getElementById('tutorExitOutput');
      let tutorsExit = tutorExitSlider.value;

      let tutorNewField = document.getElementById('tutorNewField');
      let tutorsNew = tutorNewField.value;

      let tutorViralSlider = document.getElementById('tutorViralSlider');
      let tutorViralOutput = document.getElementById('tutorViralOutput');
      let tutorsViral = tutorViralSlider.value;

      let studentInitField = document.getElementById('studentInitField');
      let students = studentInitField.value;

      let studentExitSlider = document.getElementById('studentExitSlider');
      let studentExitOutput = document.getElementById('studentExitOutput');
      let studentsExit = studentExitSlider.value;

      let studentNewField = document.getElementById('studentNewField');
      let studentsNew = studentNewField.value;

      let studentViralSlider = document.getElementById('studentViralSlider');
      let studentViralOutput = document.getElementById('studentViralOutput');
      let studentsViral = studentViralSlider.value;

      let renegadeSlider = document.getElementById('renegadeSlider');
      let renegadeOutput = document.getElementById('renegadeOutput');
      let renegades = renegadeSlider.value;

      let currentConfig = document.getElementById('currentConfig');

      let addConfig = document.getElementById('addConfig');
      let clearAll = document.getElementById('clearAll');

      let sets = {
        configurationList: Configuration.find().fetch(),
        addConfig: function(){
          addConfig.addEventListener("click", function(){
            Configuration.insert(
              {
                tutors,
                tutorsExit,
                tutorsNew,
                tutorsViral
              }
            );
          }, false);
          debugger;
          this.updateConfig(this.configurationList);
        },
        updateConfig: function(configurationList){
          currentConfig.innerHTML = this.showCurrentConfig(this.configurationList);
        },
        showCurrentConfig: function(configurationList){
          console.log(configurationList);
  
          loadCurrentButton = (id) => {
            return `<button id=${id} onClick='loadCurrent(event)'>Load</button>`
          };
  
          deleteCurrentButton = (id) => {
            return `<button id=${id} onClick='deleteCurrent(event)'>Delete this</button>`
          };
  
          html = "";
          for (i=0;i<configurationList.length;i++) {
            html += `<li key=${configurationList[i]._id}> 
                    Tutors: ${configurationList[i].tutors}, 
                    TutorsExit: ${configurationList[i].tutorsExit},
                    TutorsNew: ${configurationList[i].tutorsNew},
                    TutorsViral: ${configurationList[i].tutorsViral}, 
                    ${loadCurrentButton(configurationList[i]._id)}
                    ${deleteCurrentButton(configurationList[i]._id)}
                    </li>`;
          }
          return html;
        }
      }
      debugger;

      clearAll.addEventListener("click", function(){
        Meteor.call('clearDB');
        currentConfig.innerHTML = " ";
      })

      window.loadCurrent = (event) => {
        let loaded = Configuration.find({_id: event.target.id}).fetch();
        tutorInitField.value = loaded[0].tutors;
        tutorExitSlider.value = loaded[0].tutorsExit;
        tutorExitOutput.value = tutorExitSlider.value;
        tutorNewField.value = loaded[0].tutorsViral;
        tutorViralSlider.value = loaded[0].tutorsViral;
        tutorViralOutput.value = tutorViralSlider.value;
        tutors = tutorInitField.value;
        tutorsExit = tutorExitSlider.value;
        tutorsNew = tutorNewField.value;
        tutorsViral = tutorViralSlider.value;
        //debugger;
        updateAll();
      };

      window.deleteCurrent = (event) => {
        Configuration.remove({_id: event.target.id});
        configurationList = Configuration.find().fetch();
        currentConfig.innerHTML = showCurrentConfig(configurationList);
      }

      let intervals = Array.from(Array(iterations).keys());
      let tutorData = Array(iterations).fill(tutors);
      let studentData = Array(iterations).fill(students);

      iterationsField.addEventListener("input", function() {
        iterations = iterationsField.value;
        intervals = Array.from(new Array(parseInt(iterations)),(val, index) => index +1);
        //debugger;
        updateAll();
      }, false);

      tutorInitField.addEventListener("input", function(){
        tutors = tutorInitField.value;
        updateAll();
      }, false);

      tutorExitSlider.addEventListener("input", function(){
        tutorsExit = tutorExitSlider.value;
        tutorExitOutput.innerHTML = tutorsExit + "%";
        updateAll();
      }, false);

      tutorNewField.addEventListener("input", function(){
          tutorsNew = tutorNewField.value;
          updateAll();
      }, false);

      tutorViralSlider.addEventListener("input", function(){
        tutorsViral = tutorViralSlider.value;
        tutorViralOutput.innerHTML = tutorsViral + "%";
        updateAll();
      }, false);

      studentInitField.addEventListener("input", function() {
        students = studentInitField.value;
        updateAll();
      }, false);

      studentNewField.addEventListener("input", function() {
        studentsNew = studentNewField.value;
        updateAll();
      }, false);

      studentExitSlider.addEventListener("input", function(){
        studentsExit = studentExitSlider.value;
        studentExitOutput.innerHTML = studentsExit + "%";
        updateAll();
      }, false);

      studentViralSlider.addEventListener("input", function(){
        studentsViral = studentViralSlider.value;
        studentViralOutput.innerHTML = studentsViral + "%";
        updateAll();
      }, false);

      renegadeSlider.addEventListener("input", function(){
        renegades = renegadeSlider.value;
        renegadeOutput.innerHTML = renegades + "%";
        updateAll();
      }, false);
    
      function calculateTutors(tutors, students){
        let newTutorData = [];
        tutors = parseInt(tutors);
        tutorsExit = parseInt(tutorsExit);
        tutorsViral = parseInt(tutorsViral);
        tutorsNew = parseInt(tutorsNew);
        students = parseInt(students);
        renegades = parseInt(renegades);

        for (i=0;i<iterations;i++) {
        tutors = tutors - (tutors * (tutorsExit / 100)) + tutorsNew + (students * (renegades / 100)) + (tutors * (tutorsViral / 100));
        //console.log(tutorsViral);
        newTutorData[i] = tutors.toFixed(0);
        }

        return newTutorData;
      }

      function calculateStudents(students) {
        let newStudentData = [];
        students = parseInt(students);
        studentsExit = parseInt(studentsExit);
        studentsViral = parseInt(studentsViral);
        studentsNew = parseInt(studentsNew);
        renegades = parseInt(renegades);

        for (i=0;i<iterations;i++) {
          students = students - (students * (studentsExit / 100)) + studentsNew + (students * (studentsViral / 100))
          newStudentData[i] = students.toFixed(0);
        }

        return newStudentData;
      }
      
      function updateAll(){
        sets.addConfig();
        tutorData = calculateTutors(tutors, students);
        studentData = calculateStudents(students);
        config.data.datasets[0].data = tutorData;
        config.data.datasets[1].data = studentData;
        //debugger;
        config.data.labels = intervals;
        config.options.title.text = `# of tutors and students after ${iterations} iterations.`;

        if (intervals > 10) {
          config.options.scales.xAxes.ticks.stepSize = 2;
        }
      
        myLine.update();
        rateDisplay.innerHTML = tutorData[tutorData.length-1] / studentData[studentData.length -1];
      }

      window.onload = function(){
        updateAll();
      }

      const CHART = document.getElementById('lineChart').getContext('2d');
      
      let config = {
        type: 'line',
        data: {
          labels: intervals,
          datasets: [{ 
              data: tutorData,
              label: "Tutors",
              borderColor: "#8e5ea2",
              fill: false
              }, 
              {
              data: studentData,
              label: "Students",
              borderColor: "#3c3c3c",
              fill: false
              },
          ]
        },
        options: {
          title: {
            display: true,
            text: `# of tutors and students after ${iterations} iterations.`,
          },
          scales: {
            xAxes: [{
              ticks: {
                stepSize: 1,
                autoSkipPadding: 5,
              }
            }]
          }
        }
      }

      window.myLine = new Chart(CHART, config);

    //ReactDOM.render(<App tutors={document.getElementById('tutorInitField').value}/>, document.getElementById('app'));

    });
  });

