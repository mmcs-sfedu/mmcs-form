module.exports =
{
    getTestData : function() {
        var json = '{"feedbackForm": [{"title": "Насколько полезен с вашей точки зрения данный предмет?","type": "radio","options": ["5","4","3","2","1"]}]}';
        return JSON.parse(json)['feedbackForm'];
    }
};