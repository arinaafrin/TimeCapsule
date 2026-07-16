// This file is automatically run by Vitest before all tests.
/// <reference types="@testing-library/jest-dom" />
import { expect } from 'vitest';
import * as matchers from '@testing-library/jest-dom/matchers';

expect.extend(matchers);