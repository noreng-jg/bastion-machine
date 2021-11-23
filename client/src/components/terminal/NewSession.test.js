import { render, screen } from '@testing-library/react';
import { shallow, configure } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16'
import NewSession from './NewSession';

describe('NewSession component', () => {
  beforeAll(() => {
    configure({ adapter: new Adapter() });
  });

  it('Should render text when dialog pops up', () => {
    render(<NewSession open={ true } />);
    const elementTitle = screen.getByText('Authentication required');
    expect(elementTitle).toBeInTheDocument();
  });

  it('Should initialize the state with default values', () => {
    const wrapper = shallow(<NewSession open={ true } />);
    const instance = wrapper.instance();
    expect(instance.state.authenticated).toBe(false);
    expect(instance.state.fullScreen).toBe(false);
    expect(instance.state.username).toBe('');
    expect(instance.state.password).toBe('');
  });

  it('Should render max icon, xtermjs and update authentication to true, when the connect button is clicked', () => {
    /*
     * The connection service instance is not yet mocked :/
     * */
    const wrapper = shallow(<NewSession open={ true } />);
    const instance = wrapper.instance();
    wrapper.find('[data-test="connect-button"]').simulate('click');
    expect(instance.state.authenticated).toBe(true);
    expect(wrapper.find('[data-test="max-icon"]')).toHaveLength(1);
    expect(wrapper.find('[data-test="xtermjs"]')).toHaveLength(1);
  });

  it('Should update the fullScreen and style states when the max-icon is clicked', () => {
    const wrapper = shallow(<NewSession open={ true } />);
    const instance = wrapper.instance();
    wrapper.find('[data-test="connect-button"]').simulate('click');
    wrapper.find('[data-test="max-icon"]').simulate('click');
    expect(instance.state.fullScreen).toBe(true);
    expect(instance.state.style.height).toBe('100%');
    expect(instance.state.style.width).toBe('100%');
  });

  it('Should call props handler callback when closing the dialog', () => {
    const mock = jest.fn();
    const wrapper = shallow(<NewSession open={ true } handleOpen={mock}/>);
    const instance = wrapper.instance();
    wrapper.find('[data-test="close-icon"]').simulate('click');
    expect(mock).toHaveBeenCalled();
  });

  it('Unmounting clears state', () => {
    const wrapper = shallow(<NewSession open={ true } />);
    const instance = wrapper.instance();

    const usernameInput = wrapper.find('[data-test="username-field"]');
    const passwordInput = wrapper.find('[data-test="password-field"]');

    usernameInput.simulate('change', { target: { value: 'username' } })
    passwordInput.simulate('change', { target: { value: 'password' } })

    wrapper.find('[data-test="connect-button"]').simulate('click');
    expect(instance.state.username).toBe('username');
    expect(instance.state.password).toBe('password');
    expect(instance.state.authenticated).toBe(true);

    wrapper.unmount();

    expect(instance.state.username).toBe('');
    expect(instance.state.password).toBe('');
    expect(instance.state.authenticated).toBe(false);
  });
});
