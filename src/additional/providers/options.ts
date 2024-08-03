export const specialServiceTask = [
  {
    label: 'Copy Service Task',
    actionName: 'copy-service-task',
    className: 'ibpmn-icon-copy-service-task',
    target: {
      type: 'bpmn:ServiceTask',
      childType: 'copy'
    }
  },
  {
    label: 'Sc Service Task',
    actionName: 'sc-service-task',
    className: 'ibpmn-icon-sc-service-task',
    target: {
      type: 'bpmn:ServiceTask',
      childType: 'sc'
    }
  },
  {
    label: 'Service task',
    actionName: 'service-task',
    className: 'bpmn-icon-service',
    target: {
      type: 'bpmn:ServiceTask'
    }
  },
  {
    label: 'Dmn Service Task',
    actionName: 'dmn-service-task',
    className: 'ibpmn-icon-dmn-service-task',
    target: {
      type: 'bpmn:ServiceTask',
      childType: 'dmn'
    }
  },
  {
    label: 'Mq Service Task',
    actionName: 'mq-service-task',
    className: 'ibpmn-icon-mq-service-task',
    target: {
      type: 'bpmn:ServiceTask',
      childType: 'mq'
    }
  },
  {
    label: 'Rest Service Task',
    actionName: 'rest-service-task',
    className: 'ibpmn-icon-rest-service-task',
    target: {
      type: 'bpmn:ServiceTask',
      childType: 'rest'
    }
  },
  {
    label: 'Http Service Task',
    actionName: 'http-service-task',
    className: 'ibpmn-icon-http-service-task',
    target: {
      type: 'bpmn:ServiceTask',
      childType: 'http'
    }
  },
  {
    label: 'Mail Service Task',
    actionName: 'mail-service-task',
    className: 'ibpmn-icon-mail-service-task',
    target: {
      type: 'bpmn:ServiceTask',
      childType: 'mail'
    }
  },
  {
    label: 'Camel Service Task',
    actionName: 'camel-service-task',
    className: 'ibpmn-icon-camel-service-task',
    target: {
      type: 'bpmn:ServiceTask',
      childType: 'camel'
    }
  }
]
