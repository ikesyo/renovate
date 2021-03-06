const is = require('@sindresorhus/is');
const minimatch = require('minimatch');

module.exports = {
  commitFilesToBranch,
};

async function commitFilesToBranch(config) {
  let updatedFiles = config.updatedPackageFiles.concat(config.updatedArtifacts);
  // istanbul ignore if
  if (is.nonEmptyArray(config.excludeCommitPaths)) {
    updatedFiles = updatedFiles.filter(f => {
      const filename = f.name === '|delete|' ? f.contents : f.name;
      const matchesExcludePaths = config.excludeCommitPaths.some(path =>
        minimatch(filename, path, { dot: true })
      );
      if (matchesExcludePaths) {
        logger.debug(`Excluding ${filename} from commit`);
        return false;
      }
      return true;
    });
  }
  if (is.nonEmptyArray(updatedFiles)) {
    logger.debug(`${updatedFiles.length} file(s) to commit`);

    // istanbul ignore if
    if (config.dryRun) {
      logger.info('DRY-RUN: Would commit files to branch ' + config.branchName);
    } else {
      // API will know whether to create new branch or not
      const res = await platform.commitFilesToBranch(
        config.branchName,
        updatedFiles,
        config.commitMessage,
        config.baseBranch || undefined
      );
      if (res) {
        logger.info({ branch: config.branchName }, `Branch ${res}`);
      }
    }
  } else {
    logger.debug(`No files to commit`);
    return false;
  }
  return true;
}
