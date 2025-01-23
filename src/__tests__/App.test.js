import { render, screen } from '@testing-library/react';
import App from '../App';

test('renders calculator form', () => {
  render(<App />);
  expect(screen.getByText(/GPA Simulator/i)).toBeInTheDocument();
  expect(screen.getByText(/本页面结果仅供参考, 请以学校官方结果为准/i)).toBeInTheDocument();
});