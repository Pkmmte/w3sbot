import { transformFile } from '@swc/core'
import { readdir, mkdir, writeFile, copyFile } from 'fs/promises'
import { join, dirname, extname, relative } from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const sourceDir = join(__dirname, '..', '.robo', 'prisma')
const outputDir = join(__dirname, '..', '.robo', 'prisma') // Output alongside source files
const configOutputDir = join(__dirname, '..', '.robo', 'config', '.robo', 'prisma') // For config files

// SWC configuration
const swcOptions = {
	jsc: {
		parser: {
			syntax: 'typescript',
			tsx: false,
			decorators: false,
			dynamicImport: true
		},
		target: 'esnext',
		loose: false,
		externalHelpers: false,
		keepClassNames: true,
		transform: {
			legacyDecorator: false,
			decoratorMetadata: false
		}
	},
	module: {
		type: 'es6',
		strict: false,
		strictMode: true,
		lazy: false,
		noInterop: false
	},
	sourceMaps: false,
	minify: false
}

async function ensureDir(dir) {
	try {
		await mkdir(dir, { recursive: true })
	} catch (error) {
		if (error.code !== 'EEXIST') {
			throw error
		}
	}
}

async function compileFile(sourcePath, outputPath) {
	try {
		const result = await transformFile(sourcePath, swcOptions)
		
		// Replace .ts extensions with .js in import/export statements
		// This handles both relative imports and exports
		let code = result.code
		code = code.replace(/from\s+['"](\.\/?.*?)\.ts['"]/g, (match, path) => {
			return `from "${path}.js"`
		})
		code = code.replace(/import\s+['"](\.\/?.*?)\.ts['"]/g, (match, path) => {
			return `import "${path}.js"`
		})
		code = code.replace(/require\s*\(\s*['"](\.\/?.*?)\.ts['"]\s*\)/g, (match, path) => {
			return `require("${path}.js")`
		})
		
		await ensureDir(dirname(outputPath))
		await writeFile(outputPath, code, 'utf-8')
		console.log(`✓ Compiled: ${relative(process.cwd(), sourcePath)} -> ${relative(process.cwd(), outputPath)}`)
	} catch (error) {
		console.error(`✗ Error compiling ${sourcePath}:`, error.message)
		throw error
	}
}

async function walkDir(dir, callback) {
	const entries = await readdir(dir, { withFileTypes: true })
	
	for (const entry of entries) {
		const fullPath = join(dir, entry.name)
		
		if (entry.isDirectory()) {
			await walkDir(fullPath, callback)
		} else if (entry.isFile() && extname(entry.name) === '.ts') {
			await callback(fullPath)
		}
	}
}

async function copyCompiledFiles(fromDir, toDir) {
	await ensureDir(toDir)
	const entries = await readdir(fromDir, { withFileTypes: true })
	
	for (const entry of entries) {
		const srcPath = join(fromDir, entry.name)
		const destPath = join(toDir, entry.name)
		
		if (entry.isDirectory()) {
			await copyCompiledFiles(srcPath, destPath)
		} else if (entry.name.endsWith('.js') || entry.name.endsWith('.mjs') || entry.name.endsWith('.js.mjs') || entry.name === 'package.json') {
			await ensureDir(dirname(destPath))
			await copyFile(srcPath, destPath)
		}
	}
}

async function buildPrisma() {
	console.log('Compiling .robo/prisma TypeScript to JavaScript...\n')
	
	// Ensure output directory exists
	await ensureDir(outputDir)
	
	// Get all TypeScript files
	const files = []
	await walkDir(sourceDir, (filePath) => {
		files.push(filePath)
	})
	
	// Compile each file (create .js, .mjs, and .js.mjs for Robo.js compatibility)
	for (const sourcePath of files) {
		const relativePath = relative(sourceDir, sourcePath)
		const jsPath = join(outputDir, relativePath.replace(/\.ts$/, '.js'))
		const mjsPath = join(outputDir, relativePath.replace(/\.ts$/, '.mjs'))
		const jsMjsPath = join(outputDir, relativePath.replace(/\.ts$/, '.js.mjs'))
		await compileFile(sourcePath, jsPath)
		// Copy as .mjs and .js.mjs for Robo.js config compatibility
		await copyFile(jsPath, mjsPath)
		await copyFile(jsPath, jsMjsPath)
	}
	
	console.log(`\n✓ Successfully compiled ${files.length} file(s)`)
	
	// Copy compiled files to config directory for Robo.js config resolution
	console.log('\nCopying to .robo/config/.robo/prisma for config files...')
	await copyCompiledFiles(outputDir, configOutputDir)
	console.log('✓ Copied compiled files for config')
}

buildPrisma().catch((error) => {
	console.error('Build failed:', error)
	process.exit(1)
})

