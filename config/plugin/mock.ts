import { viteMockServe } from 'vite-plugin-mock'

export default () => {
  return viteMockServe({
    mockPath: 'mock',
    injectCode: `
        import { setupMockServer } from '../mock';
		setupMockServer();
	`
  })
}
