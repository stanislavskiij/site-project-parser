function sendToPython() {
    var { PythonShell } = require('python-shell');

    let options = {
      mode: 'text',
    };

    PythonShell.run('parser.py', options, function (err, results) {
      if (err) throw err;
      // результаты - это массив, состоящий из сообщений, собранных во время выполнения
      console.log('results: ', results);
      result.textContent = results[0];
    });
}
sendToPython();
