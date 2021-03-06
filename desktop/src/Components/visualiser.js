class Visualiser extends Module {
	constructor(props) {
		super(props)
		this.state = {
			year: new Date().getFullYear(),
			scale: props.scale || 2,
			strings: locales('logform'),
			scales: locales('visualiser'),
			svg: null,
			meta: null,
			container: null,
			mode: props.mode || null,
			querystring: null
		}

		// 'mount'
		this.state.container = elem('section', { id: 'visualiser' })

		this.state.svg = elemNS('http://www.w3.org/2000/svg', 'svg')
		this.state.svg.setAttributeNS(null, 'viewBox', '0 0 600 105')

		this.state.meta = elem('p', { className: 'vis-meta' })

		// tie it together
		this.state.container.appendChild(this.state.svg)
		this.state.container.appendChild(this.state.meta)
		this.root.appendChild(this.state.container)

		this.state.meta.addEventListener('click', () => this.setScale( this.state.scale + 1))

		this.render()
	}

	setYear(year) {
		this.state.container.className = ''
		this.state.year = year
		let thisYear = new Date()
		if (this.state.year !== thisYear.getFullYear()) {
			this.state.scale = 0 // year view
			this.render()
		} else {
			this.render()
		}
	}

	setScale (scale) {
		if (this.state.year !== new Date().getFullYear()) {
			return
		}
		this.state.container.className = ''
		this.state.scale = scale % this.state.scales.length
		this.render()
	}

	// controlled by the query module, accessed with logform
	setQuery (querystring) {
		this.setState({querystring, mode: 'query'})
	}

	async render () {
		// silently fail if no API provided
		if (!window.api && window.store != 'local') return

		const thisYear = this.state.year === new Date().getFullYear()

		// defines the query to be sent according to scaled view over time
		const makeQuery = () => {
			const monthsBack = months => {
				const d = new Date()
				let start = thisYear
					?	YYYYMMDD(new Date(this.state.year, d.getMonth() - months, 0))
					: YYYYMMDD(new Date(this.state.year, 0, 1))
				let end = thisYear
					? YYYYMMDD()
					: YYYYMMDD(new Date(this.state.year, 11, 31)) // Dec 31
				// this is v2 date formatting, each date stored as an int
				// see https://github.com/mevdschee/php-crud-api#filters
				return `&filter=date,bt,${start},${end}`
			}

			switch (this.state.scale) {
				case 0: return monthsBack(12) // whole year
				case 1: return monthsBack(6)
				case 2: return monthsBack(4)
				case 3: return monthsBack(3)
				case 4: return monthsBack(1)
			}
		}

		// returns distance in days
		const dist = (a, b) => Math.abs(Math.round(((a - b) / (1000 * 60 * 60 * 24))))
		// via https://gist.github.com/xposedbones/75ebaef3c10060a3ee3b246166caab56
		const map = (value, x1, y1, x2, y2) => (value - x1) * (y2 - x2) / (y1 - x1) + x2

		// via https://stackoverflow.com/questions/19225414/
		const hrDiff = (t1, t2) => Math.abs(t1 - t2) / 36e5

		// construct a single log <rect />
		const day = day => {
			let y = 0
			let x = thisYear
				? map(ratio * dist(furthest, fromSQL(day.date)), 0, 600, 16, 600)
				: map(ratio * dist(new Date(this.state.year, 0, 1), fromSQL(day.date)), 0, 600, 16, 600)
			let w = ratio - 0.5

			// determine y given svg viewBox height of 105
			switch (day.tod) {
				case todstrs[0].abbr: y = 10; break // in the early morning
				case todstrs[1].abbr: y = 20; break // in the morning
				case todstrs[2].abbr: y = 30; break // around midday
				case todstrs[3].abbr: y = 40; break // in the afternoon
				case todstrs[4].abbr: y = 50; break // in the evening
				case todstrs[5].abbr: y = 60; break // around nighttime
				case todstrs[6].abbr: y = 70; break // well past sundown
			}

			return elemNS('http://www.w3.org/2000/svg', 'rect', {
				x, y, width: w, height: 7, rx: 2.4,
				class: day.category,
				data: [day.project, day.date, day.hours, day.tod].join()
			}).outerHTML
		}

		// Query database for logs in date range
		const todstrs = this.state.strings.s1.values
		const qstring = this.state.querystring
		const query = qstring ? qstring : `?${makeQuery()}&exclude=ID,comment,task`

		const data = await window.storage.get(query)

		if (!data) { return }

		let svg = ''
		let fmonth = new Date().getMonth()
		let furthest

		switch (this.state.scale) {
			case 0: furthest = new Date(this.state.year, fmonth - 12); break
			case 1: furthest = new Date(this.state.year, fmonth - 6); break
			case 2: furthest = new Date(this.state.year, fmonth - 4); break
			case 3: furthest = new Date(this.state.year, fmonth - 2); break
			case 4: furthest = new Date(this.state.year, fmonth - 1); break
		}

		let ratio = thisYear ? 600 / dist(furthest, new Date()) : 1.58 // ~full year

		// create 'time of day' labels
		for (let i = 0; i < 7; i++) {
			svg += `<text x="0" y="${i * 10 + 15}">${todstrs[i].abbr}</text>`
		}

		// append logs to svg
		data.forEach( el => svg += day(el) )

		// communicate with query script
		if (this.state.mode === 'query') {
			let e = new CustomEvent('query-response', {detail:data})
			document.dispatchEvent(e)
		}

		// discover modal time of day
		// via https://stackoverflow.com/questions/52898456/
		const mode = a => {
			return Object.values(
				a.reduce((count, e) => {
					if (!(e in count)) count[e] = [0, e]
					count[e][0]++
					return count
				}, {})
			).reduce((a, v) => v[0] < a[0] ? a : v, [0, null])[1]
		}

		// most commonly entered time of day for work
		const modalTod =
			`Scale: ${this.state.scales[this.state.scale]}. Mode: ${mode(data.map(item => item.tod))}.`

		this.state.container.className = 'ready'
		this.state.svg.innerHTML = svg
		this.state.meta.innerHTML = modalTod

		// Add events to display log details on hoverW
		this.state.svg.querySelectorAll('rect').forEach(el => {
			el.addEventListener('mouseover', e => {
				const d = e.target.attributes.data.value.split(',')
				const date = fromSQL(d[1]).toDateString().slice(0, -5) // remove ' YYYY'
				const meta = ` <span class="detail">${date}, <em class="hrs">${d[2]}</em>hrs@${d[3]} on ${d[0]}</span>`
				this.state.meta.innerHTML = modalTod + meta
			})
		})

		this.state.svg.addEventListener('mouseleave', () => {
			setTimeout(() => {
				this.state.meta.innerHTML = modalTod
			}, 1000);
		})
	}
}
