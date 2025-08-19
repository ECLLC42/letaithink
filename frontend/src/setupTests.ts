// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';

// Mock GSAP and ScrollTrigger for Jest tests to avoid parsing ES modules
jest.mock('gsap', () => {
  const timeline = () => ({
    fromTo: jest.fn().mockReturnThis(),
    to: jest.fn().mockReturnThis(),
  });
  return {
    gsap: {
      timeline,
      to: jest.fn(),
      registerPlugin: jest.fn(),
    },
  };
});

jest.mock('gsap/ScrollTrigger', () => ({
  __esModule: true,
  ScrollTrigger: { getAll: jest.fn(() => []) },
}));

// Mock lottie-react which depends on canvas APIs not implemented in JSDOM
jest.mock('lottie-react', () => ({
  __esModule: true,
  default: () => null,
}));
