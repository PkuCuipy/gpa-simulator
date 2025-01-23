import { calcAvgGPA } from '../utils/miscs';

describe('GPA Calculator', () => {

  test('should calculate GPA correctly for valid single course', () => {
    // 100 分
    const grades100 = [
      { score: '100', credit: 3 },
    ];
    const expectedGPAof100 = 4.0;
    const calculatedGPAof100 = calcAvgGPA(grades100);
    expect(calculatedGPAof100).toBeCloseTo(expectedGPAof100, 6);

    // 60 分
    const grades60 = [
      { score: '60', credit: 3 },
    ];
    const expectedGPAof60 = 1.0;
    const calculatedGPAof60 = calcAvgGPA(grades60);
    expect(calculatedGPAof60).toBeCloseTo(expectedGPAof60, 6);

    // 84 分
    const grades84 = [
      { score: '84', credit: 3 },
    ];
    const expectedGPAof84 = 3.52;
    const calculatedGPAof84 = calcAvgGPA(grades84);
    expect(calculatedGPAof84).toBeCloseTo(expectedGPAof84, 2);
  });


  test('should calculate GPA correctly for valid multiple courses', () => {
    // 一门 100 分, 一门 60 分, 一门 84 分
    const grades = [
      { score: '100', credit: 3 },
      { score: '84', credit: 4 },
      { score: '60', credit: 5 },
    ];
    const expectedGPA = 2.59;
    const calculatedGPA = calcAvgGPA(grades);
    expect(calculatedGPA).toBeCloseTo(expectedGPA, 6);
  }); 


  test('should handle empty grade list and give NaN', () => {
    const grades = [];
    expect(calcAvgGPA(grades)).toBeNaN();
  });

});