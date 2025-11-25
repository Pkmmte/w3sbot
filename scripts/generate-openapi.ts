import { logger, Env } from 'robo.js'
import path from 'node:path'
import { mkdir, writeFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import swaggerJsdoc, { type Options } from 'swagger-jsdoc'

Env.loadSync()

const startTime = Date.now()

start()
	.then(() => {
		logger.ready(`Finished in ${Date.now() - startTime}ms`)
		process.exit(0)
	})
	.catch((error) => {
		logger.error(error)
		process.exit(1)
	})

async function start() {
	logger.info('Generating W3Schools Bot OpenAPI specification...')

	const currentDirectory = fileURLToPath(new URL('.', import.meta.url))
	const serverRoot = path.resolve(currentDirectory, '..')
	
	// Include both Robo.js API routes and Next.js API routes
	const roboApiPattern = path.join('src', 'api', '**', '*.ts')
	const nextApiPattern = path.join('app', 'api', '**', '*.ts')
	
	const roboApiGlob = path.join(serverRoot, roboApiPattern)
	const nextApiGlob = path.join(serverRoot, nextApiPattern)
	
	const outputDir = path.join(serverRoot, 'openapi')
	const outputPath = path.join(outputDir, 'w3sbot-openapi.json')

	const swaggerDefinition: Options['definition'] = {
		openapi: '3.1.0',
		basePath: process.env.NEXTAUTH_URL || 'http://localhost:3000',
		info: {
			title: 'W3Schools Bot API',
			version: '1.4.1',
			description: `
				API documentation for the W3Schools Discord Bot study group management system.
				
				This API enables integration between W3Schools and Discord study groups, allowing
				users to join study groups through a secure OAuth handoff process.
				
				**Key Features:**
				- Study group management (create, disband, join)
				- Secure OAuth authentication flow
				
				**Authentication:**
				- API Key: Required for study group management endpoints (x-api-key header)
				- OAuth2: Required for user-facing endpoints (Discord authentication)
			`.trim(),
			contact: {
				name: 'W3Schools Bot Support'
			}
		},
		servers: [
			{ 
				url: process.env.NEXTAUTH_URL || 'http://localhost:3000',
				description: 'Development server'
			}
		],
		components: {
			securitySchemes: {
				ApiKeyAuth: {
					type: 'apiKey',
					in: 'header',
					name: 'x-api-key',
					description: 'API key for authenticating study group management requests. Must match LEARN_TOGETHER_API_KEY environment variable.'
				},
				OAuth2: {
					type: 'oauth2',
					description: 'Discord OAuth2 authentication flow for user-facing endpoints',
					flows: {
						authorizationCode: {
							authorizationUrl: 'https://discord.com/api/oauth2/authorize',
							tokenUrl: 'https://discord.com/api/oauth2/token',
							scopes: {
								'identify': 'Access user identity information',
								'guilds.join': 'Join Discord servers on behalf of the user'
							}
						}
					}
				}
			}
		},
		tags: [
			{
				name: 'Study Groups',
				description: 'Endpoints for managing Discord study groups'
			},
			{
				name: 'Authentication',
				description: 'OAuth and authentication flow endpoints'
			}
		]
	}

	const options: Options = {
		definition: swaggerDefinition,
		apis: [roboApiGlob, nextApiGlob]
	}

	const spec = swaggerJsdoc(options) as {
		openapi?: string
		paths?: Record<string, unknown>
		components?: {
			schemas?: Record<string, unknown>
		}
	}
	const pathCount = Object.keys(spec.paths ?? {}).length
	const schemaCount = Object.keys(spec.components?.schemas ?? {}).length

	logger.info(`Collected ${pathCount} paths and ${schemaCount} schemas from ${roboApiPattern} and ${nextApiPattern}`)
	logger.info(`OpenAPI version resolved to ${spec.openapi}`)

	await mkdir(outputDir, { recursive: true })
	await writeFile(outputPath, JSON.stringify(spec, null, 2), 'utf-8')

	const relativeOutput = path.relative(serverRoot, outputPath)
	logger.info(`OpenAPI spec written to ${relativeOutput}`)
}

