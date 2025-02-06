import { extractRepoDataFromUrl, extractPullRequestDataFromUrl } from '../extractRepoDataFromUrl';

describe('extractRepoDataFromUrl', () => {
  it('should extract owner and name from a valid GitHub URL', () => {
    const url = 'https://github.com/facebook/react';
    const result = extractRepoDataFromUrl(url);
    expect(result).toEqual({
      owner: 'facebook',
      name: 'react'
    });
  });

  it('should handle URLs with .git suffix', () => {
    const url = 'https://github.com/facebook/react.git';
    const result = extractRepoDataFromUrl(url);
    expect(result).toEqual({
      owner: 'facebook',
      name: 'react'
    });
  });

  it('should throw error for non-GitHub URLs', () => {
    const url = 'https://gitlab.com/facebook/react';
    expect(() => extractRepoDataFromUrl(url)).toThrow('Invalid GitHub repository URL');
  });

  it('should throw error for invalid URLs', () => {
    const url = 'not-a-url';
    expect(() => extractRepoDataFromUrl(url)).toThrow('Invalid GitHub repository URL');
  });

  it('should throw error for GitHub URLs without owner/repo', () => {
    const url = 'https://github.com';
    expect(() => extractRepoDataFromUrl(url)).toThrow('Invalid GitHub repository URL');
  });
});

describe('extractPullRequestDataFromUrl', () => {
  it('should extract owner, name and PR number from a valid PR URL', () => {
    const url = 'https://github.com/facebook/react/pull/123';
    const result = extractPullRequestDataFromUrl(url);
    expect(result).toEqual({
      owner: 'facebook',
      name: 'react',
      prNumber: 123
    });
  });

  it('should handle URLs with .git suffix', () => {
    const url = 'https://github.com/facebook/react.git/pull/123';
    const result = extractPullRequestDataFromUrl(url);
    expect(result).toEqual({
      owner: 'facebook',
      name: 'react',
      prNumber: 123
    });
  });

  it('should throw error for non-GitHub URLs', () => {
    const url = 'https://gitlab.com/facebook/react/pull/123';
    expect(() => extractPullRequestDataFromUrl(url)).toThrow('Not a GitHub URL');
  });

  it('should throw error for GitHub URLs without pull request', () => {
    const url = 'https://github.com/facebook/react';
    expect(() => extractPullRequestDataFromUrl(url)).toThrow('Invalid GitHub pull request URL format');
  });

  it('should throw error for invalid PR numbers', () => {
    const url = 'https://github.com/facebook/react/pull/abc';
    expect(() => extractPullRequestDataFromUrl(url)).toThrow('Invalid pull request number');
  });

  it('should throw error for invalid URLs', () => {
    const url = 'not-a-url';
    expect(() => extractPullRequestDataFromUrl(url)).toThrow('Invalid GitHub pull request URL');
  });
});
